// Backend data contract from ZFM_CDMEMO_RP_863
export interface MemoHeader {
  documentNumber: string;      // document_number
  documentTypeText: string;     // document_type_text
  billingDate: string;          // billing_date
  reference: string;            // reference
  netValue: number;             // net_value
  currency: string;             // currency
  documentType?: string;        // Used for filtering (G2/L2)
}

// Legacy interface - kept for backward compatibility if needed
export interface CreditDebitNote {
  documentNumber: string;
  invoiceReference: string;
  amount: number;
  currency: string;
  reason: string;
  date: string;
  docType: 'CREDIT' | 'DEBIT';
  status: 'Open' | 'Applied' | 'Cancelled';
  lineItems?: CreditDebitLineItem[];
}

export interface CreditDebitLineItem {
  itemNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  amount: number;
}