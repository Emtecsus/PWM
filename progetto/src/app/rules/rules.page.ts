import { Component, OnInit } from '@angular/core';
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
export class RulesPage implements OnInit {

  isLoading: boolean = true;
  isFlippedOca       = false;
  isFlippedPonte     = false;
  isFlippedLocanda   = false;
  isFlippedPrigione  = false;
  isFlippedMorte     = false;
  
  /*rules = [
    { title: 'Regola 1', description: 'Descrizione della regola 1.' },
    { title: 'Regola 2', description: 'Descrizione della regola 2.' },
    { title: 'Regola 3', description: 'Descrizione della regola 3.' },
  ];
*/
  constructor(private router: Router) {
    addIcons({'flame-outline': flameOutline,
      'walk-outline': walkOutline,
      'bed-outline': bedOutline,
      'lock-closed-outline': lockClosedOutline,
      'skull-outline': skullOutline,
      'paw-outline': pawOutline});
  }

  ngOnInit() {
    // Simula un caricamento di 2 secondi prima di mostrare le regole
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
  onHome(){
    this.router.navigateByUrl("/home");
  }

}

