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
  maxPlayers = this.defaultMaxPlayers;
  maxCells = this.defaultMaxCells;
  numCells = this.defaultNumCells;
  vsCpu = this.defaultVsCpu;


  constructor(private modalCtrl: ModalController) { }
  confirm() {
    this.modalCtrl.dismiss({
      maxPlayers: this.maxPlayers,
      maxCells: this.maxCells,
      numCells: this.numCells,
      vsCpu: this.vsCpu
    });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }
  ngOnInit() {}

}
