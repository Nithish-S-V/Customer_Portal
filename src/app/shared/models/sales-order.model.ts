export interface SalesOrder {
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  status: 'Open' | 'In Process' | 'Completed' | 'Cancelled';
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
