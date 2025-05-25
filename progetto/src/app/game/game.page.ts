import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, MenuController } from '@ionic/angular';
@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GamePage implements OnInit {

  constructor(private menu: MenuController) {}
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
  getCellGradientColor(value: number | null): string {
  if (!value) return 'transparent';

  // Hue: verde 120°, rosso 0°
  // Calcolo inverso per andare da verde (120) a rosso (0)
  const hue = 120 - ((value - 1) / 62) * 120; 

  // Saturation and lightness fissi per un bel colore pieno
  const saturation = 70;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

}
