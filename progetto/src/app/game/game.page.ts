import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { firstValueFrom } from 'rxjs';
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
  constructor(public router:Router, private gameService: GameService, private cdr: ChangeDetectorRef) {}
  gridSize = 8;
  board: number[][] = [];
  players: any[] = [];
  penaltyBackValue: number | null = null;
  gameId: string = '';
  userId: string = localStorage.getItem('token') || '';
  winnerUsername: string | null = null;
  gameFinished: boolean = false;
  availablePawns = ['goose_musc.png', 'goose_classy1.png', 'goose_magic.png', 'goose_party.png'];
  selectedPawn = 'goose_musc.png';
  showPawnSelector = false;
  specialEffectMessage: string = '';
  myUsername: string = '';
  // Mappa delle celle speciali attuali
  specialCells: { [key: number]: { type: string; value: number } } = {};
  currentTurnUsername: string = '';
  private isPolling = false; // Variabile di protezione per le chiamate asincrone
  diceValues: { [userId: string]: number } = {};
  isRolling = false;

  async getUsernameById(userId: string): Promise<string> {
    try {
      const res = await firstValueFrom(this.gameService.getUsernameById(userId));
      return res['Username cercato'] || 'Sconosciuto';
    } catch (err) {
      return 'Errore';
    }
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
    this.gameId=localStorage.getItem('game_id') || '';
    this.generateSpiralBoard();
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
    const saved = localStorage.getItem('pawn_' + this.userId);
    if (saved) this.selectedPawn = saved;
    if (this.userId) {
      this.gameService.getUsernameById(this.userId).subscribe({
        next: (res) => {
          this.myUsername = res['Username cercato'];
        },
        error: (err) => {
          console.error('Errore nel recupero username:', err);
          this.myUsername = 'Sconosciuto';
        }
      });
    }
    this.updateGameState();
    this.startPollingGameState();
  }

  startPollingGameState() {
    this.pollingInterval = setInterval(() => {
      if (!this.isPolling) {
        this.isPolling = true;
        this.updateGameState().finally(() => this.isPolling = false);
      }
    }, 2000);
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

    const isCpuThrow = userId !== this.userId;
    if (!isCpuThrow && this.isRolling) return;

    if (!isCpuThrow) this.isRolling = true;

    this.gameService.rollDice(userId, this.gameId).subscribe({
      next: (res) => {
        if (!isCpuThrow) {
          if (res.dice >= 1 && res.dice <= 6) {
            this.diceValues[this.userId] = res.dice;
          }
          this.isRolling = false;

          // ✅ Mostra messaggi solo se l'effetto riguarda il player locale
          if (res.back !== undefined) {
            this.specialEffectMessage = `Casella speciale! Torni indietro di ${res.back} caselle.`;
          } else if (res?.message?.includes('Turn skipped')) {
            this.specialEffectMessage = 'Casella speciale! Salti il prossimo turno.';
          } else {
            this.specialEffectMessage = '';
          }

        } else {
          // ❌ Se è CPU, nessun messaggio speciale
          this.specialEffectMessage = '';
        }

        this.updateGameState();
      },
      error: (err) => {
        console.error('Errore nel lancio del dado:', err);
        if (!isCpuThrow) this.isRolling = false;
      }
    });
  }



  async updateGameState(): Promise<void> {
    try {
      const data = await firstValueFrom(this.gameService.getGameState(this.gameId));
      const game = data.game;
      this.players = game.players;

      this.gameService.getUsernameById(game.current_turn).subscribe({
        next: res => this.currentTurnUsername = res['Username cercato'] || 'Sconosciuto',
        error: _ => this.currentTurnUsername = 'Sconosciuto'
      });

      if (game.status === 'finished') {
        this.gameFinished = true;
        if (game.winner) {
          this.gameService.getUsernameById(game.winner).subscribe({
            next: res => this.winnerUsername = res['Username cercato'] || 'Sconosciuto',
            error: _ => this.winnerUsername = 'Sconosciuto'
          });
        }
        return;
      }

      const currentTurn = game.current_turn;
      const player = this.players.find(p => p.user_id === currentTurn);
      const isCpu = player?.is_cpu;

      if (isCpu) {
        setTimeout(() => this.rollDice(currentTurn), 1000);
      }

    } catch (err) {
      console.error('Errore nel recuperare lo stato della partita:', err);
    }
  }


  goHome() {
    localStorage.removeItem('game_id');
    this.router.navigate(['/home']);
  }


  ngOnDestroy() {
    clearInterval(this.pollingInterval);
  }

  
}
