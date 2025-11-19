import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../shared/models/customer.model';
import { ApiService } from '../shared/services/api.service';

export interface ProfileUpdateRequest {
  email: string;
  phone: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
}

export interface ProfileApiResponse {
  success: boolean;
  profile: Customer;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  constructor(private apiService: ApiService) { }

  getProfile(): Observable<Customer> {
    return this.apiService.get<ProfileApiResponse>('/profile').pipe(
      map(response => response.profile)
    );
  }

  updateProfile(profileData: ProfileUpdateRequest): Observable<ProfileUpdateResponse> {
    return this.apiService.put<ProfileUpdateResponse>('/profile', profileData);
  }
}
