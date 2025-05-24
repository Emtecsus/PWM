import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule, NgIf } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [IonicModule, CommonModule, NgIf],
})
export class SidebarComponent implements OnInit {
  @Input() menuId = '';
  currentRoute = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private menu: MenuController
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
    await this.menu.close(this.menuId);
      this.router.navigateByUrl(path);
  }

}
