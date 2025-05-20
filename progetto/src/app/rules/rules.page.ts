import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.page.html',
  styleUrls: ['./rules.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RulesPage implements OnInit {

  isLoading: boolean = true;

  rules = [
    { title: 'Regola 1', description: 'Descrizione della regola 1.' },
    { title: 'Regola 2', description: 'Descrizione della regola 2.' },
    { title: 'Regola 3', description: 'Descrizione della regola 3.' },
  ];

  constructor() { }

  ngOnInit() {
    // Simula un caricamento di 2 secondi prima di mostrare le regole
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

}

