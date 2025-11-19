import { TestBed } from '@angular/core/testing';

import { InquiryService } from './inquiry';

describe('InquiryService', () => {
  let service: InquiryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InquiryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create inquiry and return mock response', (done) => {
    const mockInquiry = {
      productCode: 'PROD001',
      quantity: 10,
      deliveryDate: '2025-06-15',
      description: 'Test inquiry'
    };

    service.createInquiry(mockInquiry).subscribe(response => {
      expect(response.success).toBeTruthy();
      expect(response.inquiryNumber).toMatch(/^INQ\d{4}$/);
      expect(response.message).toBe('Inquiry submitted successfully');
      done();
    });
  });
});
