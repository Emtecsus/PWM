import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule, NgIf } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [IonicModule, CommonModule, NgIf,FormsModule],
})
export class SidebarComponent implements OnInit {
  @Input() menuId = '';
  currentRoute = '';
  difficulty: string = 'medium';
  gameTime: number = 30; // Valore predefinito (minuti)
  isMultiplayer: boolean = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    private menuCtrl: MenuController,
  ) {}

  ngOnInit() {
    // Aggiorna la route attiva ogni volta che cambia
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentRoute = (event as NavigationEnd).urlAfterRedirects;
    });
  }

  shouldShow(targetRoute: string): boolean {
    return this.currentRoute !== targetRoute;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  async onClick(path: string) {
    this.router.navigateByUrl(path);
  }
  

   startGame() {
    const settings = {
      difficulty: this.difficulty,
      gameTime: this.gameTime,
      isMultiplayer: this.isMultiplayer
    };

    console.log('Impostazioni selezionate:', settings);
    this.closeMenu(); // Chiudi il menu dopo la conferma

    // Aggiungi qui la logica per avviare il gioco (es. navigazione o chiamata API)
  }

  // Chiudi il menu
  closeMenu() {
    this.menuCtrl.close('game-settings');
  }
  // Aggiorna il tempo di gioco (es. se usi un range dinamico)
  updateGameTime(event: any) {
    this.gameTime = event.detail.value;
  }

}
