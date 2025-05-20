import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import {IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports:[IonicModule],
})
export class HomePage {
  constructor(private menu: MenuController) {}

  openMenu() {
    console.log('Pulsante cliccato!');
    this.menu.open("barra");          // apre il menu con id "first"
  }
}



