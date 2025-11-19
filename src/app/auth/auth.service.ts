import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    USER_ID: string;
    username: string;
    role: string;
  };
  message: string;
}

export interface User {
  username: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:3443/api';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      username,
      password
    }).pipe(
      map(response => {
        if (response.success && response.token) {
          // Store token and user info in localStorage
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('user_role', response.user.role);
          localStorage.setItem('username', response.user.username);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
      }),
      catchError(error => {
        console.error('Login error:', error);
        const errorMessage = error.error?.error || 'Login failed. Please try again.';
        return throwError(() => ({ error: errorMessage }));
      })
    );
  }

  register(username: string, password: string, email: string, name: string, customerNumber?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, {
      username,
      password,
      email,
      name,
      customerNumber
    }).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        const errorMessage = error.error?.error || 'Registration failed. Please try again.';
        return throwError(() => ({ error: errorMessage }));
      })
    );
  }

  logout(): void {
    // Clear all authentication data from localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUser(): any {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
}
