import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports:[IonicModule],
})
export class SidebarComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
    
  }

}



