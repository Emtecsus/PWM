import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  form: FormGroup;
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  onLogin(){
    this.router.navigateByUrl('/login');
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value;

    this.authService.register(username, password).subscribe({
      next: (res) => {
        alert('Registrazione completata!');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante la registrazione: ' + (err.error?.error || ''));
      }
    });
  }
}
