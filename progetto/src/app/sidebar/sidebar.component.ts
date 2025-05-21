import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports:[IonicModule],
})
export class SidebarComponent {
    @Input() menuId = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private menu:MenuController
  ) {}

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
    
  }
  onRules(){
    this.menu.close(this.menuId);
    this.router.navigateByUrl('/rules');
  }

}



