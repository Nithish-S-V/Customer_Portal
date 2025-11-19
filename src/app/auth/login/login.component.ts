import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, LoginResponse } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isRegisterMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    if (this.isRegisterMode) {
      this.onRegister(username, password);
    } else {
      this.onLogin(username, password);
    }
  }

  onLogin(username: string, password: string): void {
    this.authService.login(username, password).subscribe({
      next: (response: LoginResponse) => {
        // Token and user info are already stored by the auth service
        this.isLoading = false;
        this.snackBar.open('Login successful! Welcome back.', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.errorMessage = error.error || 'Invalid credentials. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onRegister(username: string, password: string): void {
    // For now, registration requires additional fields (email, name)
    // This is a simplified version - you may want to add more form fields
    const email = `${username}@example.com`; // Placeholder
    const name = username; // Placeholder
    
    this.authService.register(username, password, email, name).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Registration successful! Please login.', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Switch to login mode after successful registration
        this.isRegisterMode = false;
        this.loginForm.reset();
      },
      error: (error: any) => {
        this.errorMessage = error.error || 'Registration failed. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.loginForm.reset();
  }
}
