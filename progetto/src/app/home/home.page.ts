import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import {IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports:[IonicModule,CommonModule,FormsModule, ReactiveFormsModule,],
})
export class HomePage {
  showGameSettings = false; // Controlla la visibilità del menu
  
  // Dati selezionabili
  difficulty = 'medium';
  players = 1;
  gameTime = 30;
  isMultiplayer = false;
  constructor(private menu: MenuController,private router: Router,private authService: AuthService,) {}
   gridSize = 8;
  board: number[][] = [];

  ngOnInit() {
    this.generateSpiralBoard();
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

   openMenu(){
    this.menu.open('game-settings'); // Apre il side-menu della Home
  }

  startGame(){
    console.log(this.difficulty, this.gameTime, this.isMultiplayer);
    // Fai partire il gioco...
    this.menu.close('game-settings'); // Dopo aver confermato, chiudi il side-menu
  }

}





