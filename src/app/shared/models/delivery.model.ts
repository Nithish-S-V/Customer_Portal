export interface Delivery {
  deliveryNumber: string;
  salesOrderReference: string;
  deliveryDate: string;
  status: 'Planned' | 'In Transit' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  lineItems?: DeliveryLineItem[];
}

export interface DeliveryLineItem {
  itemNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  shippingInfo: string;
}
