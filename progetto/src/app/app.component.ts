import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true, // fondamentale per standalone components
  imports: [IonApp, IonRouterOutlet, SidebarComponent,CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  constructor(){}
}
