import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InquiryFormComponent } from './inquiry-form';

describe('InquiryFormComponent', () => {
  let component: InquiryFormComponent;
  let fixture: ComponentFixture<InquiryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryFormComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.inquiryForm.get('productCode')?.value).toBe('');
    expect(component.inquiryForm.get('quantity')?.value).toBe('');
    expect(component.inquiryForm.get('deliveryDate')?.value).toBe('');
    expect(component.inquiryForm.get('description')?.value).toBe('');
  });

  it('should validate required fields', () => {
    expect(component.inquiryForm.valid).toBeFalsy();
    
    component.inquiryForm.patchValue({
      productCode: 'PROD001',
      quantity: 10,
      deliveryDate: new Date(),
      description: 'Test description'
    });
    
    expect(component.inquiryForm.valid).toBeTruthy();
  });

  it('should validate quantity is greater than 0', () => {
    component.inquiryForm.patchValue({
      quantity: 0
    });
    
    expect(component.inquiryForm.get('quantity')?.hasError('min')).toBeTruthy();
    
    component.inquiryForm.patchValue({
      quantity: 1
    });
    
    expect(component.inquiryForm.get('quantity')?.hasError('min')).toBeFalsy();
  });

  it('should validate description length', () => {
    const longDescription = 'a'.repeat(501);
    component.inquiryForm.patchValue({
      description: longDescription
    });
    
    expect(component.inquiryForm.get('description')?.hasError('maxlength')).toBeTruthy();
  });

  it('should count description characters correctly', () => {
    component.inquiryForm.patchValue({
      description: 'Test'
    });
    
    expect(component.descriptionCharacterCount).toBe(4);
  });
});
