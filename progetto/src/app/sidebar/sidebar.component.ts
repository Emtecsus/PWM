import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule, NgIf } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
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
  gameTime: number = 30;
  isMultiplayer: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private menu: MenuController,
    private modalCtrl: ModalController
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
      time: this.gameTime,
      multiplayer: this.isMultiplayer
    };
    this.modalCtrl.dismiss(settings);
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

}
