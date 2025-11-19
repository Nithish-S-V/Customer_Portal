export interface Inquiry {
  inquiryNumber: string;
  productCode: string;
  quantity: number;
  deliveryDate: string;
  description: string;
  status: 'Submitted' | 'Under Review' | 'Quoted' | 'Rejected';
}
