/**
 * Invoice model matching Master API Specification
 * All properties in camelCase as per SAP ZFM_INVOICE_DETAILS_RP_863
 */
export interface Invoice {
  itemNumber: string;           // vbrp~posnr
  documentNumber: string;        // vbrk~vbeln
  billingDate: string;          // vbrk~fkdat (YYYY-MM-DD format)
  soldToParty: string;          // vbrk~kunag
  customerName: string;         // kna1~name1
  customerId: string;           // kna1~kunnr
  materialNumber: string;       // vbrp~matnr
  materialDescription: string;  // vbrp~arktx
  netValue: number;             // vbrp~netwr
  currency: string;             // vbrk~waerk
  salesOrg: string;             // vbrk~vkorg
  street: string;               // kna1~stras
  city: string;                 // kna1~ort01
  country: string;              // kna1~land1
  postalCode: string;           // kna1~pstlz
}
