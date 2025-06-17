import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import {IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';
import { ModalController } from '@ionic/angular';
import { GameSettingsModalComponent } from '../components/game-settings-modal/game-settings-modal.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports:[IonicModule,CommonModule,FormsModule, ReactiveFormsModule,],
})
export class HomePage {
  settingsOpen = false;
  selectedMode: string | null = null;
  maxPlayers: number | null = null;
  maxCells: number | null = null;
  numCells: number | null = null;
  vsCpu: boolean = false;
  canJoinOrCreate = true;
  availableGames: any[] = [];

  constructor(private menu: MenuController,public router: Router,private authService: AuthService,private gameService: GameService, private modalCtrl: ModalController) {}
   gridSize = 8;
  board: number[][] = [];

  async ngOnInit() {
    this.generateSpiralBoard();
    const storedGameId = localStorage.getItem('game_id');
    this.canJoinOrCreate = await this.gameService.checkCanCreate(storedGameId || '');
    if (this.canJoinOrCreate) {
    this.fetchAvailableGames();
  }
  }

  generateSpiralBoard() {
    const size = this.gridSize;
    this.board = Array.from({ length: size }, () => Array(size).fill(null));
    let value = 0;
    let top = 0;
    let bottom = size - 1;
    let left = 0;
    let right = size - 1;


    while (value <= 63) {
      // Top row
      for (let i = left; i <= right && value <= 63; i++) {
        this.board[top][i] = value++;
      }
      top++;

      // Right column
      for (let i = top; i <= bottom && value <= 63; i++) {
        this.board[i][right] = value++;
      }
      right--;

      // Bottom row
      for (let i = right; i >= left && value <= 63; i--) {
        this.board[bottom][i] = value++;
      }
      bottom--;

      // Left column
      for (let i = bottom; i >= top && value <= 63; i--) {
        this.board[i][left] = value++;
      }
      left++;
    }
    
  }
  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  onRules(){
    this.router.navigateByUrl('/rules');
  }

  async openSettings() {
    const modal = await this.modalCtrl.create({
      component: GameSettingsModalComponent,
      componentProps: {
        defaultMaxPlayers: this.maxPlayers,
        defaultMaxCells: this.maxCells,
        defaultNumCells: this.numCells,
        defaultVsCpu: this.vsCpu
      }
    });

    modal.onDidDismiss().then(result => {
      const data = result.data;
      if (!data) return;

      this.maxPlayers = data.maxPlayers;
      this.maxCells = data.maxCells;
      this.numCells = data.numCells;
      this.vsCpu = data.vsCpu;

      this.startGame(); // ora starta dopo conferma e chiude da solo
    });

    await modal.present();
  }

  startGame() {
    this.settingsOpen = false;

    const userId = localStorage.getItem('token');
    if (!userId) {
      alert('Token utente non trovato!');
      return;
    }

    // Costruzione opzioni dinamiche (solo se settate)
    const options: any = {};

    if (this.maxPlayers != null) options.max_players = this.maxPlayers;
    if (this.maxCells != null) options.max_cells = this.maxCells;
    if (this.numCells != null) options.num_cells = this.numCells;

    this.gameService.createGame(userId, this.vsCpu, options).subscribe({
      next: (res) => {
        localStorage.setItem('game_id', res.game_id);
        this.router.navigateByUrl('/game');
      },
      error: (err) => {
        console.error('Errore nella creazione partita:', err);
        alert('Errore durante la creazione della partita');
      }
    });
  }
fetchAvailableGames() {
    const userId = localStorage.getItem('token');
    if (!userId) return;

    this.gameService.listGames(userId).subscribe({
      next: (res) => {
        this.availableGames = res.available_games || [];
      },
      error: (err) => {
        console.error('Errore nel caricamento partite disponibili:', err);
      }
    });
  }

  joinGame(gameId: string) {
    const userId = localStorage.getItem('token');
    if (!userId) return;

    this.gameService.joinGame(userId).subscribe({
      next: (res) => {
        localStorage.setItem('game_id', res.game_id);
        this.router.navigateByUrl('/game');
      },
      error: (err) => {
        console.error('Errore nel join:', err);
        alert('Errore durante il join della partita');
      }
    });
  }
}





