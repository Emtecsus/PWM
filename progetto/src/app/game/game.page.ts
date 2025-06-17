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

  selectPawn(pawnName: string) {
    this.selectedPawn = pawnName;
    localStorage.setItem('pawn_' + this.userId, pawnName);
    this.showPawnSelector = false;
  }

  togglePawnSelector() {
    this.showPawnSelector = !this.showPawnSelector;
  }

  ngOnInit() {
    console.log(this.userId);
    console.log(this.gameId);
    this.generateSpiralBoard();
    
    const saved = localStorage.getItem('pawn_' + this.userId);
    if (saved) this.selectedPawn = saved;

    this.updateGameState();
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
    const stored = localStorage.getItem('pawn_' + userId);
    return stored ? 'assets/imgs/' + stored : 'assets/imgs/goose_musc.png';
  }

  rollDice(userIdOverride?: string) {
  const userId = userIdOverride || this.userId;

  fetch('https://api.peppeponte.duckdns.org/roll_dice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, game_id: this.gameId })
  })
  .then(res => res.json())
  .then(() => this.updateGameState());
}


  updateGameState() {
  fetch(`https://api.peppeponte.duckdns.org/game_state/${this.gameId}`)
    .then(res => res.json())
    .then(data => {
      const game = data.game;
      this.players = game.players;

      if (game.status === 'finished') {
        this.gameFinished = true;

        // Prendi username del vincitore
        if (game.winner) {
          fetch(`https://api.peppeponte.duckdns.org/get_username/${game.winner}`)
            .then(res => res.json())
            .then(user => {
              this.winnerUsername = user['Username cercato'];
            });
        }

        return; // ⛔ Interrompi il resto della funzione (niente roll per CPU)
      }

      // Se il gioco non è finito, valuta se è turno di un CPU
      const currentTurn = game.current_turn;
      const player = this.players.find(p => p.user_id === currentTurn);
      const isCpu = player?.is_cpu;

      if (isCpu) {
        setTimeout(() => this.rollDice(currentTurn), 1000);
      }
    });
}


  
}
