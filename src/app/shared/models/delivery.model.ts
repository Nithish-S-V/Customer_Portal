export interface Delivery {
  deliveryNumber: string;           // vbeln - Delivery Document Number
  customerNumber: string;            // kunnr - Customer Number
  shippingPoint: string;             // vstel - Shipping Point
  createdBy: string;                 // ernam - Created By
  createdDate: string;               // erdat - Creation Date
  itemNumber: string;                // posnr - Item Number
  productCode: string;               // matnr - Material Number
  productDescription: string;        // arktx - Material Description
  deliveryQuantity: number;          // lfimg - Delivery Quantity
  unit: string;                      // vrkme - Sales Unit
  status: 'Planned' | 'In Transit' | 'Delivered' | 'Cancelled';
  
  // Legacy fields for backward compatibility
  salesOrderReference?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  lineItems?: DeliveryLineItem[];
}

export interface DeliveryLineItem {
  itemNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  shippingInfo: string;
}
