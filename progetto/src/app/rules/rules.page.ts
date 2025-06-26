import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {flameOutline,
  walkOutline,
  bedOutline,
  lockClosedOutline,
  skullOutline,
  pawOutline} from 'ionicons/icons';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.page.html',
  styleUrls: ['./rules.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RulesPage {

  isFlippedOca       = false;
  isFlippedPonte     = false;
  isFlippedLocanda   = false;
  isFlippedPrigione  = false;
  isFlippedMorte     = false;
  isFlippedCacciatore = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    addIcons({'flame-outline': flameOutline,
      'walk-outline': walkOutline,
      'bed-outline': bedOutline,
      'lock-closed-outline': lockClosedOutline,
      'skull-outline': skullOutline,
      'paw-outline': pawOutline});
  }

  onHome(){
    this.router.navigateByUrl("/home").then(() => {
      this.cdr.detectChanges(); // Forza il rilevamento dei cambiamenti
    });
  }

}

