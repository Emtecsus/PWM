import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonLabel, IonRow } from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    CommonModule, 
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonCol,
    IonRow,
    IonGrid]
})
export class SignupPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
