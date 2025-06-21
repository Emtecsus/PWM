import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-settings-modal',
  templateUrl: './game-settings-modal.component.html',
  styleUrls: ['./game-settings-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule, CommonModule],
})
export class GameSettingsModalComponent  implements OnInit {
  @Input() defaultMaxPlayers: number | null = null;
  @Input() defaultMaxCells: number | null = null;
  @Input() defaultNumCells: number | null = null;
  @Input() defaultVsCpu: boolean = false;
  maxPlayers: number | null = null;  
  maxCells: number | null = null;    
  numCells: number | null = null;    
  vsCpu: boolean = false; 


  constructor(private modalCtrl: ModalController) { }
  

  ngOnInit() {
    this.maxPlayers = this.defaultMaxPlayers;
    this.maxCells = this.defaultMaxCells;
    this.numCells = this.defaultNumCells;
    this.vsCpu = this.defaultVsCpu;
  }

}
