export interface Payment {
  paymentNumber: string;
  invoiceReference: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK' | 'CASH';
  status: 'Pending' | 'Completed' | 'Failed';
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  method: string;
}
