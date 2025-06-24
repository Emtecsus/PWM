from flask import Flask, request, jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import random
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"])
DB = 'database/gioco_dell_oca.db'

# Caselle con penalità (es. perdi un turno o torna indietro di X)
PENALTY_CELLS = {
    6: {'type': 'back', 'value': 2},
    19: {'type': 'back', 'value': 3},
    31: {'type': 'skip', 'value': 1},
    52: {'type': 'back', 'value': 4},
    58: {'type': 'skip', 'value': 1},
}


# Testata e funziona
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = generate_password_hash(data['password'])
    user_id = str(uuid.uuid4())

    try:
        with sqlite3.connect(DB) as conn:
            conn.execute("INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
                         (user_id, username, password))
        return jsonify({'message': 'User registered successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400

# Testata e funziona


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("SELECT id, password FROM users WHERE username=?", (username,))
        result = c.fetchone()
        if result and check_password_hash(result[1], password):
            return jsonify({'message': 'Login successful', 'user_id': result[0]})
        return jsonify({'error': 'Invalid credentials'}), 401
    
@app.route('/get_username/<user_id>', methods=['GET'])
def get_username(user_id):
    conn= sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT username FROM users WHERE id=?", (user_id,))
    result = c.fetchone()
    if result:
        return jsonify({'Username cercato': result[0]}), 200
    else:
        return jsonify({'error': f'Nessun utente trovato per ID: {user_id}'}), 404

# @app.route('/set_special_cells', methods=['POST'])
def set_special_cells(info=None): # non usata si potrebbe togliere
    user_id = info['user_id']
    game_id = info['game_id']
    
    if user_id is None or game_id is None:
        return jsonify({'error': 'UserID e Game ID sono obbligatori'}), 400
    
    if info['cells'] is not None:
        cells = info['cells']
        global gen_cells
        gen_cells = cells  # Salva le celle speciali nella variabile globale
    else:
        return jsonify({'error': 'Devi impostare le celle speciali'}), 400

    with sqlite3.connect(DB) as conn:
        # Verifica che l'utente sia il creatore del gioco
        c = conn.cursor()
        c.execute(
            "SELECT user_id FROM game_players WHERE game_id=? AND is_cpu=0 LIMIT 1", (game_id,))
        creator = c.fetchone()

        if not creator or creator[0] != user_id:
            return jsonify({'error': 'Only game creator can set special cells'}), 403

        # Verifica che il gioco sia in stato 'waiting'
        c.execute("SELECT status FROM games WHERE id=?", (game_id,))
        status = c.fetchone()[0]
        if status != 'waiting':
            return jsonify({'error': 'Special cells can only be set before game starts'}), 400

        # Salva le caselle speciali
        conn.execute("UPDATE games SET special_cells=? WHERE id=?",
                     (json.dumps(cells), game_id))

    return jsonify({'message': 'Special cells set successfully'})


# @app.route('/generate_random_special_cells', methods=['POST'])
def generate_random_special_cells(info=None): 
# cambiata per generare solo back e skip ed inoltre ritorna il dizionario cells al posto di usare set_special_cells
# siccome in create_game si passano comunque al db le celle speciali
    game_id = info['game_id']
    user_id = info['user_id']
    
    if user_id is None or game_id is None:
        return jsonify({'error': 'UserID e Game ID sono obbligatori'}), 400
    
    num_cells = info['num_cells']

    # Genera caselle casuali
    cells = {}
    positions = random.sample(range(1, 62), num_cells)

    for pos in positions:
        # Solo 'back' o 'skip' come tipo di casella
        cell_type = random.choice(['back', 'skip'])
        value = random.randint(1, 3) if cell_type == 'back' else 1  # 'back' avrà un valore random da 1 a 3, 'skip' avrà valore 1
        cells[pos] = {'type': cell_type, 'value': value}

    # Ritorna le celle generate
    return cells



# Aggiunta da noi
@app.route('/lista_games/<user_id>', methods=['GET'])
def all_games(user_id):
    """
    Restituisce tutte le partite disponibili (in stato 'waiting') 
    dove l'utente specificato non è già un giocatore
    """
    try:
        with sqlite3.connect(DB) as conn:
            conn.row_factory = sqlite3.Row  # Permette accesso alle colonne per nome
            c = conn.cursor()
            # Query che cerca partite waiting dove l'utente non è già presente
            c.execute('''
                SELECT 
                    g.id as game_id,
                    g.status,
                    g.max_players,
                    g.player_count as current_players,
                    (
                        SELECT u.username 
                        FROM game_players gp
                        JOIN users u ON gp.user_id = u.id
                        WHERE gp.game_id = g.id AND gp.is_cpu = 0
                        LIMIT 1
                    ) as creator
                FROM 
                    games g
                WHERE 
                    g.status = 'waiting'
                    AND g.player_count < g.max_players
                    AND NOT EXISTS (
                        SELECT 1 
                        FROM game_players gp 
                        WHERE gp.game_id = g.id AND gp.user_id = ?
                    )
            ''', (user_id,))
            games = []
            for row in c.fetchall():
                game = dict(row)
                # Aggiungi informazioni aggiuntive se necessario
                games.append(game)
            
            return jsonify({
                'available_games': games,
                'count': len(games)
            }), 200
            
    except sqlite3.Error as e:
        return jsonify({
            'error': 'Database error',
            'details': str(e)
        }), 500

# Cambiata in modo tale che si possano generare le caselle in modo casuale, deprecate le caselle di default PENALTY_CELLS
@app.route('/create_game', methods=['POST'])
def create_game():
    data = request.get_json()
    user_id = data['user_id']
    vs_cpu = data['vs_cpu']
    max_players = data.get('max_players', 4)  # valore di default sarà 4 giocatori
    max_cells = data.get('max_cells', 63)     # non usato perchè non necessario
    num_cells = data['num_cells'] if 'num_cells' in list(data.keys()) != None else 5  # numero di caselle speciali da generare
    cells = data['cells'] if 'cells' in list(data.keys()) != None else None # non usato perchè non necessario
    game_id = str(uuid.uuid4())

    # Se le celle non sono fornite, generiamo celle casuali
    if cells:
        special_cells = cells
    else:
        special_cells = generate_random_special_cells(info={'game_id': game_id, 'user_id': user_id, 'num_cells': num_cells})

    try:
        with sqlite3.connect(DB) as conn:
            c = conn.cursor()
            # Verifico che l'utente esiste
            c.execute("SELECT 1 FROM users WHERE id=?", (user_id,))
            if not c.fetchone():
                return jsonify({'error': 'User not found'}), 404
            
            # Creo la partita nel database
            c.execute('''
                    INSERT INTO games 
                    (id, status, current_turn, max_players, max_cells, player_count, special_cells) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    game_id,
                    'waiting',    # Stato iniziale
                    user_id,     # Primo turno al creatore
                    max_players,
                    max_cells,
                    1,           # Inizia con 1 giocatore
                    json.dumps(special_cells)  # Salva le celle speciali come JSON
                ))
            player_count = 1
            
            conn.execute("INSERT INTO game_players (game_id, user_id, position, is_cpu) VALUES (?, ?, ?, ?)",
                        (game_id, user_id, 0, 0))
            
            # Se gioco vs CPU, aggiungi la CPU
            if vs_cpu:
                cpu_id = str(uuid.uuid4())
                conn.execute("INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
                            (cpu_id, 'CPU_' + cpu_id[:5], ''))
                conn.execute(
                    "INSERT INTO game_players (game_id, user_id, position, is_cpu) VALUES (?, ?, ?, ?)", (game_id, cpu_id, 0, 1))

                if player_count + 1 == max_players:
                    conn.execute(
                        "UPDATE games SET status = 'ongoing', player_count = ? WHERE id = ?", (player_count + 1, game_id,))
                else:
                    conn.execute(
                        "UPDATE games SET player_count = ? WHERE id = ?", (player_count + 1, game_id,))

        return jsonify({
            'message': 'Game created successfully',
            'game_id': game_id,
            'status': 'waiting',
            'max_players': max_players,
            'current_players': 1,
            'max_cells': max_cells,
            'special_cells': special_cells  # Mostra le celle speciali generate
        }), 201
    except sqlite3.Error as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

# Modificata in modo tale che possiamo prendere le partite in corso vecchie
@app.route('/join_game', methods=['POST'])
def join_game():
    data = request.get_json()
    user_id = data['user_id']
    game_id = data['game_id']

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()

        # Verifica che la partita esista e sia in stato 'waiting'
        c.execute('''
            SELECT 
                status, player_count, max_players
            FROM games
            WHERE id = ?
        ''', (game_id,))
        game = c.fetchone()

        if not game:
            return jsonify({'error': 'Partita non trovata'}), 404

        status, current_players, max_players = game

        if status != 'waiting':
            return jsonify({'error': 'La partita non è più disponibile'}), 400

        if current_players >= max_players:
            return jsonify({'error': 'La partita è piena'}), 400

        # Verifica che l'utente non sia già iscritto
        c.execute('''
            SELECT 1 FROM game_players WHERE game_id = ? AND user_id = ?
        ''', (game_id, user_id))
        if c.fetchone():
            return jsonify({'error': 'Sei già iscritto a questa partita'}), 400

        # Aggiungi il giocatore
        c.execute('''
            INSERT INTO game_players (game_id, user_id, position, is_cpu)
            VALUES (?, ?, 0, 0)
        ''', (game_id, user_id))

        new_count = current_players + 1
        if new_count == max_players:
            c.execute('''
                UPDATE games
                SET player_count = ?, status = 'ongoing'
                WHERE id = ?
            ''', (new_count, game_id))
        else:
            c.execute('''
                UPDATE games
                SET player_count = ?
                WHERE id = ?
            ''', (new_count, game_id))

        return jsonify({'message': 'Joined game', 'game_id': game_id}), 200


# Modificata Logica per il waiting, modificata logica delle caselle "back",aggiunto un ritorno per quando si vince (non funziona come previsto)
# Cambiata logica di confronto tra caselle del db e new_pos
@app.route('/roll_dice', methods=['POST'])
def roll_dice():
    data = request.get_json()
    user_id = data['user_id']
    game_id = data['game_id']
    dice = random.randint(1, 6)

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()

        # Check if game is finished
        c.execute("SELECT * FROM games WHERE id=? AND status='finished'", (game_id,))
        finished = c.fetchone()
        if finished:
            return jsonify({'error': 'Game already finished'}), 400
        
        # Check if game is waiting
        c.execute("SELECT * FROM games WHERE id=? AND status='waiting'", (game_id,))
        waiting = c.fetchone()
        if waiting:
            return jsonify({'error': 'Game is waiting'}), 400

        # Check current turn
        c.execute("SELECT current_turn FROM games WHERE id=?", (game_id,))
        current_turn = c.fetchone()
        if not current_turn or current_turn[0] != user_id:
            return jsonify({'error': 'Not your turn'}), 403

        # Get max cells
        c.execute("SELECT max_cells FROM games WHERE id=?", (game_id,))
        max_cells = c.fetchone()[0]

        # Get player position and skip_turn
        c.execute("SELECT position, skip_turn FROM game_players WHERE game_id=? AND user_id=?", (game_id, user_id))
        row = c.fetchone()
        pos, skip = row

        # Handle skip turn
        if skip:
            conn.execute("UPDATE game_players SET skip_turn=0 WHERE game_id=? AND user_id=?", (game_id, user_id))
            # Advance turn
            c.execute("SELECT user_id FROM game_players WHERE game_id=?", (game_id,))
            players = [row[0] for row in c.fetchall()]
            next_index = (players.index(user_id) + 1) % len(players)
            next_turn = players[next_index]
            conn.execute("UPDATE games SET current_turn=? WHERE id=?", (next_turn, game_id))
            return jsonify({'message': 'Turn skipped due to penalty'})

        # Roll and update position
        new_pos = pos + dice
        conn.execute("UPDATE game_players SET position=? WHERE game_id=? AND user_id=?",
                     (new_pos, game_id, user_id))

        # Get special cells from the database
        c.execute("SELECT special_cells FROM games WHERE id=?", (game_id,))
        special_cells_json = c.fetchone()[0]

        # If special_cells is None or empty, assign an empty dictionary
        special_cells = {}
        if special_cells_json:
            try:
                special_cells = json.loads(special_cells_json)
                # Convert keys from strings to integers
                special_cells = {int(key): value for key, value in special_cells.items()}
            except json.JSONDecodeError:
                return jsonify({'error': 'Error decoding special cells data'}), 500

        # Check for penalty after move using special_cells
        if new_pos in special_cells:
            penalty = special_cells[new_pos]
            if penalty['type'] == 'back':
                back_value = penalty['value']
                back_pos = max(0, new_pos - back_value)
                conn.execute("UPDATE game_players SET position=? WHERE game_id=? AND user_id=?",
                             (back_pos, game_id, user_id))

                # Advance turn
                c.execute("SELECT user_id FROM game_players WHERE game_id=?", (game_id,))
                players = [row[0] for row in c.fetchall()]
                next_index = (players.index(user_id) + 1) % len(players)
                next_turn = players[next_index]
                conn.execute("UPDATE games SET current_turn=? WHERE id=?", (next_turn, game_id))

                return jsonify({
                    'back': back_value,
                    'dice': dice,
                    'new_position': back_pos
                })
            elif penalty['type'] == 'skip':
                conn.execute("UPDATE game_players SET skip_turn=1 WHERE game_id=? AND user_id=?",
                             (game_id, user_id))

        # Check win condition
        if new_pos > max_cells:
            new_pos = max_cells - (new_pos - max_cells)
            conn.execute("UPDATE game_players SET position=? WHERE game_id=? AND user_id=?",
                         (new_pos, game_id, user_id))
        elif new_pos == max_cells:
            conn.execute("UPDATE games SET status='finished', winner=? WHERE id=?",
                         (user_id, game_id))
            return jsonify({
                'dice': dice,
                'new_position': new_pos
            })

        # Advance turn
        c.execute("SELECT user_id FROM game_players WHERE game_id=?", (game_id,))
        players = [row[0] for row in c.fetchall()]
        next_index = (players.index(user_id) + 1) % len(players)
        next_turn = players[next_index]
        conn.execute("UPDATE games SET current_turn=? WHERE id=?",
                     (next_turn, game_id))

    return jsonify({
        'message': 'Dice rolled',
        'dice': dice,
        'new_position': new_pos
    })


@app.route('/game_state/<game_id>', methods=['GET'])
def game_state(game_id):
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM games WHERE id=?", (game_id,))
        game = c.fetchone()
        
        print(game)
        
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        c.execute(
            "SELECT user_id, position, is_cpu, skip_turn FROM game_players WHERE game_id=?", (game_id,))
        players = [{'user_id': row[0], 'position': row[1], 'is_cpu': bool(
            row[2]), 'skip_turn': bool(row[3])} for row in c.fetchall()]
        
        

        return jsonify({
            'game': {
                'id': game[0],
                'status': game[1],
                'current_turn': game[2],
                'winner': game[3],
                'players': players,
                "special_cells": json.loads(game[-4]) if game[-4] else {},
                "max_cells": game[-1],
            }
        })
# Aggiunta
@app.route('/my_games/<user_id>', methods=['GET'])
def my_games(user_id):
    try:
        with sqlite3.connect(DB) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute('''
                SELECT 
                    g.id as game_id,
                    g.player_count as current_players,
                    g.max_players
                FROM 
                    games g
                JOIN 
                    game_players gp ON g.id = gp.game_id
                WHERE 
                    gp.user_id = ?
                    AND g.status != 'finished'
            ''', (user_id,))
            
            games = [
                {
                    'game_id': row['game_id'],
                    'current_players': row['current_players'],
                    'max_players': row['max_players']
                } for row in c.fetchall()
            ]
            return jsonify({'joined_games': games, 'count': len(games)}), 200

    except sqlite3.Error as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
