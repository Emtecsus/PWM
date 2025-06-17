import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GamePage implements OnInit {

  constructor() {}

  gridSize = 8;
  board: number[][] = [];
  players: any[] = [];

  gameId: string = '...'; // imposta dinamicamente
  userId: string = '...'; // imposta dinamicamente

  availablePawns = ['pawn_red.png', 'pawn_green.png', 'pawn_blue.png', 'pawn_yellow.png'];
  selectedPawn = 'pawn_red.png';

  ngOnInit() {
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
    return stored ? 'assets/' + stored : 'assets/pawn_default.png';
  }

  rollDice() {
    fetch('http://localhost:5000/roll_dice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: this.userId, game_id: this.gameId })
    })
    .then(res => res.json())
    .then(() => this.updateGameState());
  }

  updateGameState() {
    fetch(`http://localhost:5000/game_state/${this.gameId}`)
      .then(res => res.json())
      .then(data => {
        this.players = data.game.players;
      });
  }
}
