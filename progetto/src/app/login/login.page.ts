import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class LoginPage {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  onSignup() {
  this.router.navigateByUrl('/signup');
}

onForgotPassword() {
  // Puoi decidere se aprire un alert o navigare in una pagina
  alert('Funzione non ancora disponibile');
}

  onSubmit() {
    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.authService.login(username, password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.user_id);
        this.router.navigateByUrl('/home').then(() => {
          this.cdr.detectChanges(); // Forza il rilevamento dei cambiamenti
        });
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante il login: ' + (err.error?.error || ''));
      }
    });
  }
}
