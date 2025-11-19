import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProfileService } from '../profile';
import { Customer } from '../../shared/models/customer.model';

@Component({
  selector: 'app-profile-view',
  imports: [SharedModule],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css',
})
export class ProfileViewComponent implements OnInit {
  customer: Customer | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (customer) => {
        this.customer = customer;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile. Please try again later.';
        this.isLoading = false;
        console.error('Failed to load profile', error);
      }
    });
  }

  onEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }
}
