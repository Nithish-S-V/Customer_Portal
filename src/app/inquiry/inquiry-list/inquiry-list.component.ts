import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { InquiryService, Inquiry } from '../inquiry';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './inquiry-list.component.html',
  styleUrls: ['./inquiry-list.component.css']
})
export class InquiryListComponent implements OnInit {
  inquiries: Inquiry[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  displayedColumns: string[] = ['inquiryNumber', 'productCode', 'productDescription', 'createdDate', 'validTo', 'amount'];

  constructor(
    private inquiryService: InquiryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inquiryService.getInquiries().subscribe({
      next: (data) => {
        this.inquiries = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading inquiries:', error);
        this.errorMessage = 'Failed to load inquiries. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  onCreateNew(): void {
    this.router.navigate(['/inquiry/form']);
  }

  onRetry(): void {
    this.loadInquiries();
  }
}
