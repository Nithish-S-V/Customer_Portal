import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        switch (error.status) {
          case 401:
            // Unauthorized - clear localStorage and redirect to login
            this.clearAuthenticationData();
            this.router.navigate(['/login']);
            errorMessage = 'Your session has expired. Please log in again.';
            break;

          case 403:
            // Forbidden - permission denied
            errorMessage = 'You do not have permission to access this resource.';
            break;

          case 404:
            // Not found
            errorMessage = 'The requested resource was not found.';
            break;

          case 500:
            // Internal server error
            errorMessage = 'A system error occurred. Please try again later.';
            break;

          case 0:
            // Network error (no internet connection, server down, etc.)
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;

          default:
            // Generic error message for other status codes
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            } else {
              errorMessage = 'An unexpected error occurred. Please try again.';
            }
            break;
        }

        // Return formatted error
        const formattedError = {
          status: error.status,
          message: errorMessage,
          originalError: error
        };

        return throwError(() => formattedError);
      })
    );
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthenticationData(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  }
}