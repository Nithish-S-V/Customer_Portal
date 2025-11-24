export interface SalesOrder {
  orderNumber: string;          // vbeln - Sales Document Number
  orderDate: string;             // erdat - Creation Date
  createdBy: string;             // ernam - Created By
  documentType: string;          // auart - Document Type
  productCode: string;           // matnr - Material Number
  productDescription: string;    // arktx - Material Description
  itemNumber: string;            // posnr - Item Number
  amount: number;                // netwr - Net Value
  currency: string;              // waerk - Currency
  status: 'Open' | 'In Process' | 'Completed' | 'Cancelled';
  
  // Legacy fields for backward compatibility
  deliveryDate?: string;
  totalAmount?: number;
  lineItems?: SalesOrderLineItem[];
}

export interface SalesOrderLineItem {
  itemNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
