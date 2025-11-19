import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = 'https://localhost:3443/api';

  constructor(private http: HttpClient) {}

  /**
   * Get Authorization header from localStorage
   */
  private getAuthorizationHeader(): string {
    const token = localStorage.getItem('jwt_token');
    return token ? `Bearer ${token}` : '';
  }

  /**
   * Build HTTP headers with Authorization
   */
  private buildHeaders(): HttpHeaders {
    const authHeader = this.getAuthorizationHeader();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    }
    
    return headers;
  }

  /**
   * HTTP GET request
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers: this.buildHeaders() });
  }

  /**
   * HTTP POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.buildHeaders() });
  }

  /**
   * HTTP PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.buildHeaders() });
  }

  /**
   * HTTP DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers: this.buildHeaders() });
  }

  /**
   * HTTP GET request for binary data (Blob)
   * Used for downloading files like PDFs
   */
  getBlob(endpoint: string): Observable<Blob> {
    const authHeader = this.getAuthorizationHeader();
    let headers = new HttpHeaders();
    
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    }

    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers: headers,
      responseType: 'blob'
    });
  }
}
