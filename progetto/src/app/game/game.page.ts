import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GamePage implements OnInit {
  isLoading: boolean = true;
  private pollingInterval: any;
  constructor(public router:Router) {}
  
  gridSize = 8;
  board: number[][] = [];
  players: any[] = [];

  gameId: string = localStorage.getItem('game_id') || ''; // TODO imposta dinamicamente
  userId: string = localStorage.getItem('token') || '';
  winnerUsername: string | null = null;
  gameFinished: boolean = false;
  availablePawns = ['goose_musc.png', 'goose_classy1.png', 'goose_magic.png', 'goose_party.png'];
  selectedPawn = 'goose_musc.png';
  showPawnSelector = false;
  // Variabile per il messaggio dell'effetto speciale
  specialEffectMessage: string = '';
  myUsername: string = '';
  // Mappa delle celle speciali attuali
  specialCells: { [key: number]: { type: string; value: number } } = {};
  // Username del giocatore il cui turno è attivo
  currentTurnUsername: string = '';
  // Funzione per ottenere lo username via ID (verifica se è già nel file)
  async getUsernameById(userId: string): Promise<string> {
    const response = await fetch(`https://api.peppeponte.duckdns.org/get_username/${userId}`);
    const data = await response.json();
    return data['Username cercato'] || 'Sconosciuto';
  }


  selectPawn(pawnName: string) {
    this.selectedPawn = pawnName;
    localStorage.setItem('pawn_' + this.userId, pawnName);
    this.showPawnSelector = false;
  }

  togglePawnSelector() {
    this.showPawnSelector = !this.showPawnSelector;
  }

  ngOnInit() {
    this.generateSpiralBoard();
    const saved = localStorage.getItem('pawn_' + this.userId);
    if (saved) this.selectedPawn = saved;
    const userId = localStorage.getItem('token');
    if (userId) {
      fetch(`https://api.peppeponte.duckdns.org/get_username/${userId}`)
        .then(res => res.json())
        .then(data => {
          this.myUsername = data['Username cercato'];
        });
    }
    

    this.updateGameState();
    this.startPollingGameState();
  }

  startPollingGameState() {
    this.pollingInterval = setInterval(() => {
      this.updateGameState();
    }, 2000); // ogni 2 secondi
  }
  generateSpiralBoard() {
    const size = this.gridSize;
    this.board = Array.from({ length: size }, () => Array(size).fill(null));
    let value = 0, top = 0, bottom = size - 1, left = 0, right = size - 1;

    while (value <= 63) {
      for (let i = left; i <= right && value <= 63; i++) this.board[top][i] = value++;
      top++;
      for (let i = top; i <= bottom && value <= 63; i++) this.board[i][right] = value++;
      right--;
      for (let i = right; i >= left && value <= 63; i--) this.board[bottom][i] = value++;
      bottom--;
      for (let i = bottom; i >= top && value <= 63; i--) this.board[i][left] = value++;
      left++;
    }
  }
  

  getCellGradientColor(value: number | null): string {
    if (!value) return 'transparent';
    const hue = 120 - ((value - 1) / 62) * 120;
    return `hsl(${hue}, 70%, 50%)`;
  }

  savePawnChoice() {
    localStorage.setItem('pawn_' + this.userId, this.selectedPawn);
  }

  getPawnImage(userId: string): string {
    const index = this.players.findIndex(p => p.user_id === userId);
    if (index >= 0 && index < this.availablePawns.length) {
      return 'assets/imgs/' + this.availablePawns[index];
    }
    // fallback
    return 'assets/imgs/goose_musc.png';
  }

  rollDice(userIdOverride?: string) {
    const userId = userIdOverride || this.userId;

    fetch('https://api.peppeponte.duckdns.org/roll_dice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, game_id: this.gameId })
    })
    .then(res => res.json())
    .then(res => {
      const effetto = res?.message || '';
      if (effetto.includes('Turn skipped')) {
        this.specialEffectMessage = 'Casella speciale! Salti il prossimo turno.';
      } else if (effetto.includes('Dice rolled') && res.new_position !== undefined) {
        const cellType = this.specialCells[res.new_position];
        if (cellType?.type === 'back') {
          this.specialEffectMessage = `Casella speciale! Torni indietro di ${cellType.value} caselle.`;
        } else if (cellType?.type === 'skip') {
          this.specialEffectMessage = 'Casella speciale! Salti il turno.';
        } else {
          this.specialEffectMessage = '';
        }
      }
      this.updateGameState();
    })

  }


  async updateGameState() {
    const res = await fetch(`https://api.peppeponte.duckdns.org/game_state/${this.gameId}`);
    const data = await res.json();
    const game = data.game;

    this.players = game.players;
    this.currentTurnUsername = await this.getUsernameById(game.current_turn);

    if (game.status === 'finished') {
      this.gameFinished = true;

      if (game.winner) {
        this.winnerUsername = await this.getUsernameById(game.winner);
      }

      return;
    }

    const currentTurn = game.current_turn;
    const player = this.players.find(p => p.user_id === currentTurn);
    const isCpu = player?.is_cpu;

    if (isCpu) {
      setTimeout(() => this.rollDice(currentTurn), 1000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.pollingInterval);
  }

  
}
