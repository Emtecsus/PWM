import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import {IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports:[IonicModule,CommonModule],
})
export class HomePage {
  constructor(private menu: MenuController) {}
   gridSize = 9;
  board: number[][] = [];

  ngOnInit() {
    this.generateSpiralBoard();
  }

  generateSpiralBoard() {
    const size = this.gridSize;
    this.board = Array.from({ length: size }, () => Array(size).fill(null));

    let value = 1;
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





