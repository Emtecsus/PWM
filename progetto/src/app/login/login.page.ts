import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonItem, IonLabel} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    CommonModule, 
    FormsModule,
    IonItem,
    IonLabel,
    IonButton,
    IonInput]
})
export class LoginPage implements OnInit {

  constructor(private router: Router) { }
  onSignup(){
    this.router.navigate(['/signup']);
  }
  onForgotPassword(){
    this.router.navigate(['/forgot-password']);
  }
  ngOnInit() {
  }

}
