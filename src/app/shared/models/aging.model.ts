/**
 * Aging models for Finance Sheet
 */

export interface AgingSummary {
  days0to30: number;
  days31to60: number;
  days61to90: number;
  days91Plus: number;
  totalOutstanding: number;
  currency: string;
}

export interface AgingDetail {
  invoiceNumber: string;
  billingDate: string;
  dueDate: string;
  daysOverdue: number;
  amountDue: number;
  currency: string;
}
