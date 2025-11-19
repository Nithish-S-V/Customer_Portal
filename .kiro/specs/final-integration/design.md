# Design Document

## Overview

This design document describes the final integration of the Customer Portal, connecting the Angular frontend to 11 SAP web services via Node.js middleware. The integration includes navigation refactoring, dashboard KPI implementation, Finance Sheet creation, bug fixes, and complete API endpoint implementation.

### Integration Goals

1. **Navigation Refactoring**: Update sidebar, create Finance Sheet page, simplify dashboard
2. **Dashboard KPI Logic**: Aggregate data from 5 SAP services to display counts
3. **Finance Sheet Tabs**: Wire up 4 tabs to respective API endpoints
4. **Bug Fixes**: Fix change detection, Quick Access layout, data mapping issues
5. **API Implementation**: Complete all middleware endpoints for SAP service integration
6. **Data Consistency**: Establish Master Data Contract with camelCase naming

### Available SAP Web Services

1. **ZRFC_CUST_INQUIRY_863**: Returns inquiry list
2. **ZRFC_SALEORDERS_863**: Returns sales order list
3. **ZRFC_DELIVERY_LIST_863**: Returns delivery list
4. **ZRFC_INVOICE_DETAILS_863**: Returns invoice line items
5. **ZRFC_OVERALLSALES_863**: Returns overall sales records
6. **ZRFC_MEMOS_863**: Returns credit/debit memos
7. **ZRFC_AGING_863**: Returns aging summary
8. **ZRFC_PROFILE_863**: Returns customer profile
9. **ZRFC_LOGIN_863**: Validates user credentials
10. **ZRFC_DELIVERY_DETAILS_863**: Returns delivery details
11. **ZRFC_SALESORDER_DETAILS_863**: Returns sales order details

## Architecture

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  ANGULAR FRONTEND                        │
│                                                          │
│  Dashboard → GET /api/dashboard/stats                    │
│  Finance Sheet → GET /api/invoices, /api/memos, etc.    │
│  Inquiries → GET /api/inquiries                          │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS/JSON
                       ▼
┌─────────────────────────────────────────────────────────┐
│              NODE.JS MIDDLEWARE                          │
│                                                          │
│  Dashboard Stats: Parallel calls to 5 services          │
│  Data Mapping: SAP fields → camelCase                   │
│  Error Handling: Try-catch with user-friendly messages  │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                       │ SOAP/XML
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  SAP WEB SERVICES                        │
│                                                          │
│  11 ZRFC_* services providing all portal data           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```



### Master Data Contract

**Naming Convention**: All property names use camelCase format

**SAP Field → Frontend Property Mapping**:
```
DOCUMENT_NUMBER    → documentNumber
CREATION_DATE      → creationDate
CREATED_BY         → createdBy
MATERIAL_DESC      → materialDescription
NET_VALUE          → netValue
CURRENCY           → currency
CUSTOMER_NAME      → customerName
INVOICE_DATE       → invoiceDate
DUE_DATE           → dueDate
DELIVERY_DATE      → deliveryDate
ORDER_NUMBER       → orderNumber
SALES_ORDER_REF    → salesOrderReference
TRACKING_NUMBER    → trackingNumber
```

**Implementation**: Middleware performs mapping in response handlers before returning JSON to frontend.

## Components and Interfaces

### 1. Dashboard KPI Implementation

**Endpoint**: `GET /api/dashboard/stats`

**Middleware Logic**:
```javascript
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    // Execute 5 parallel SAP service calls
    const [inquiries, salesOrders, deliveries, invoices, overallSales] = await Promise.all([
      soapService.call('ZRFC_CUST_INQUIRY_863', { IV_CUSTOMER_ID: customerId }),
      soapService.call('ZRFC_SALEORDERS_863', { IV_CUSTOMER_ID: customerId }),
      soapService.call('ZRFC_DELIVERY_LIST_863', { IV_CUSTOMER_ID: customerId }),
      soapService.call('ZRFC_INVOICE_DETAILS_863', { IV_CUSTOMER_ID: customerId }),
      soapService.call('ZRFC_OVERALLSALES_863', { IV_CUSTOMER_ID: customerId })
    ]);
    
    // Calculate counts
    const totalInquiries = inquiries.length;
    const totalSalesOrders = salesOrders.length;
    const totalDeliveries = deliveries.length;
    
    // For invoices, count unique document numbers
    const uniqueInvoices = new Set(invoices.map(item => item.DOCUMENT_NUMBER));
    const totalInvoices = uniqueInvoices.size;
    
    const totalOverallSales = overallSales.length;
    
    res.json({
      success: true,
      stats: {
        totalInquiries,
        totalSalesOrders,
        totalDeliveries,
        totalInvoices,
        totalOverallSales
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard statistics'
    });
  }
});
```

**Frontend Component**:
```typescript
export class DashboardComponent implements OnInit {
  dashboardSummary = {
    totalInquiries: 0,
    totalSalesOrders: 0,
    totalDeliveries: 0,
    totalInvoices: 0,
    totalOverallSales: 0
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef  // FIX: Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.get<any>('/dashboard/stats').subscribe({
      next: (response) => {
        this.dashboardSummary = response.stats;
        this.isLoading = false;
        this.cdr.detectChanges();  // FIX: Trigger change detection
      },
      error: (error) => {
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;
        this.cdr.detectChanges();  // FIX: Trigger change detection
      }
    });
  }

  retryLoad(): void {
    this.loadDashboardStats();
  }
}
```

**Requirements**: 3.1, 3.5, 4.1-4.8, 7.1-7.5

---

### 2. Finance Sheet Component Structure

**Module**: `src/app/finance/finance.module.ts`

**Component**: `src/app/finance/finance-sheet.component.ts`

**Template**:
```html
<div class="finance-sheet-container">
  <h1>Finance Sheet</h1>
  
  <mat-tab-group class="finance-tabs" color="primary">
    <mat-tab label="Invoice">
      <div class="tab-content">
        <app-invoice-list></app-invoice-list>
      </div>
    </mat-tab>
    
    <mat-tab label="Credit/Debit">
      <div class="tab-content">
        <app-credit-debit-list></app-credit-debit-list>
      </div>
    </mat-tab>
    
    <mat-tab label="Aging">
      <div class="tab-content">
        <app-aging></app-aging>
      </div>
    </mat-tab>
    
    <mat-tab label="Overall Sales">
      <div class="tab-content">
        <app-overall-sales></app-overall-sales>
      </div>
    </mat-tab>
  </mat-tab-group>
</div>
```

**Requirements**: 2.1-2.5, 6.1-6.5

---

### 3. Inquiry List Component

**Component**: `src/app/inquiry/inquiry-list.component.ts`

**Template**:
```html
<div class="inquiry-list-container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Inquiries</mat-card-title>
    </mat-card-header>

    <mat-card-content>
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
        <p>Loading inquiries...</p>
      </div>

      <div *ngIf="errorMessage && !isLoading" class="error-container">
        <p class="error-message">{{ errorMessage }}</p>
        <button mat-button color="primary" (click)="loadInquiries()">Retry</button>
      </div>

      <table mat-table [dataSource]="inquiries" *ngIf="!isLoading && !errorMessage">
        <ng-container matColumnDef="documentNumber">
          <th mat-header-cell *matHeaderCellDef>Document Number</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.documentNumber }}</td>
        </ng-container>

        <ng-container matColumnDef="creationDate">
          <th mat-header-cell *matHeaderCellDef>Creation Date</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.creationDate | date:'MM/dd/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="materialDescription">
          <th mat-header-cell *matHeaderCellDef>Material Description</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.materialDescription }}</td>
        </ng-container>

        <ng-container matColumnDef="netValue">
          <th mat-header-cell *matHeaderCellDef>Net Value</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.netValue | currency:inquiry.currency }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card-content>
  </mat-card>
</div>
```

**Component Logic**:
```typescript
export class InquiryListComponent implements OnInit {
  inquiries: Inquiry[] = [];
  displayedColumns = ['documentNumber', 'creationDate', 'materialDescription', 'netValue'];
  isLoading = false;
  errorMessage = '';

  constructor(
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef  // FIX: Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.inquiryService.getInquiries().subscribe({
      next: (data) => {
        this.inquiries = data;
        this.isLoading = false;
        this.cdr.detectChanges();  // FIX: Trigger change detection
      },
      error: (error) => {
        this.errorMessage = 'Failed to load inquiries';
        this.isLoading = false;
        this.cdr.detectChanges();  // FIX: Trigger change detection
      }
    });
  }
}
```

**Requirements**: 5.1-5.6, 7.1-7.5, 11.1-11.5

---



### 4. Quick Access Layout Fix

**File**: `src/app/dashboard/dashboard/dashboard.css`

**CSS Changes**:
```css
.quick-links-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.quick-link-card {
  flex: 0 1 calc(25% - 16px);
  min-width: 200px;
  cursor: pointer;
  transition: transform 0.2s;
}

.quick-link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .quick-link-card {
    flex: 0 1 calc(50% - 16px);
  }
}
```

**Requirements**: 8.1-8.5

---

### 5. API Endpoint Implementations

#### GET /api/inquiries

```javascript
router.get('/inquiries', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    const result = await soapService.call('ZRFC_CUST_INQUIRY_863', {
      IV_CUSTOMER_ID: customerId
    });
    
    // Map SAP fields to camelCase
    const inquiries = result.map(item => ({
      documentNumber: item.DOCUMENT_NUMBER,
      creationDate: item.CREATION_DATE,
      createdBy: item.CREATED_BY,
      materialDescription: item.MATERIAL_DESC,
      netValue: parseFloat(item.NET_VALUE),
      currency: item.CURRENCY
    }));
    
    res.json({
      success: true,
      inquiries
    });
    
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load inquiries'
    });
  }
});
```

#### GET /api/invoices

```javascript
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    const result = await soapService.call('ZRFC_INVOICE_DETAILS_863', {
      IV_CUSTOMER_ID: customerId
    });
    
    // Map and group by document number
    const invoiceMap = new Map();
    
    result.forEach(item => {
      const docNum = item.DOCUMENT_NUMBER;
      if (!invoiceMap.has(docNum)) {
        invoiceMap.set(docNum, {
          documentNumber: docNum,
          customerName: item.CUSTOMER_NAME,
          invoiceDate: item.INVOICE_DATE,
          dueDate: item.DUE_DATE,
          netValue: 0,
          currency: item.CURRENCY,
          status: item.STATUS
        });
      }
      invoiceMap.get(docNum).netValue += parseFloat(item.NET_VALUE);
    });
    
    const invoices = Array.from(invoiceMap.values());
    
    res.json({
      success: true,
      invoices
    });
    
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load invoices'
    });
  }
});
```

#### GET /api/memos

```javascript
router.get('/memos', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    const result = await soapService.call('ZRFC_MEMOS_863', {
      IV_CUSTOMER_ID: customerId
    });
    
    const memos = result.map(item => ({
      documentNumber: item.DOCUMENT_NUMBER,
      documentType: item.DOCUMENT_TYPE,
      referenceInvoice: item.REFERENCE_INVOICE,
      amount: parseFloat(item.AMOUNT),
      currency: item.CURRENCY,
      reason: item.REASON,
      creationDate: item.CREATION_DATE
    }));
    
    res.json({
      success: true,
      memos
    });
    
  } catch (error) {
    console.error('Error fetching memos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load credit/debit memos'
    });
  }
});
```

#### GET /api/aging/summary

```javascript
router.get('/aging/summary', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    const result = await soapService.call('ZRFC_AGING_863', {
      IV_CUSTOMER_ID: customerId
    });
    
    const agingSummary = result.map(item => ({
      agingBucket: item.AGING_BUCKET,
      amount: parseFloat(item.AMOUNT),
      currency: item.CURRENCY,
      invoiceCount: parseInt(item.INVOICE_COUNT)
    }));
    
    res.json({
      success: true,
      agingSummary
    });
    
  } catch (error) {
    console.error('Error fetching aging summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load aging summary'
    });
  }
});
```

#### GET /api/sales/overall

```javascript
router.get('/sales/overall', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    const result = await soapService.call('ZRFC_OVERALLSALES_863', {
      IV_CUSTOMER_ID: customerId
    });
    
    const overallSales = result.map(item => ({
      documentNumber: item.DOCUMENT_NUMBER,
      salesDate: item.SALES_DATE,
      materialDescription: item.MATERIAL_DESC,
      quantity: parseFloat(item.QUANTITY),
      netValue: parseFloat(item.NET_VALUE),
      currency: item.CURRENCY
    }));
    
    res.json({
      success: true,
      overallSales
    });
    
  } catch (error) {
    console.error('Error fetching overall sales:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load overall sales'
    });
  }
});
```

**Requirements**: 10.1-10.8, 9.1-9.5

---

## Data Models

### TypeScript Interfaces

```typescript
// Dashboard
export interface DashboardStats {
  totalInquiries: number;
  totalSalesOrders: number;
  totalDeliveries: number;
  totalInvoices: number;
  totalOverallSales: number;
}

// Inquiry
export interface Inquiry {
  documentNumber: string;
  creationDate: string;
  createdBy: string;
  materialDescription: string;
  netValue: number;
  currency: string;
}

// Invoice
export interface Invoice {
  documentNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  netValue: number;
  currency: string;
  status: string;
}

// Memo (Credit/Debit)
export interface Memo {
  documentNumber: string;
  documentType: 'CREDIT' | 'DEBIT';
  referenceInvoice: string;
  amount: number;
  currency: string;
  reason: string;
  creationDate: string;
}

// Aging
export interface AgingBucket {
  agingBucket: string;  // e.g., "0-30 days", "31-60 days"
  amount: number;
  currency: string;
  invoiceCount: number;
}

// Overall Sales
export interface OverallSales {
  documentNumber: string;
  salesDate: string;
  materialDescription: string;
  quantity: number;
  netValue: number;
  currency: string;
}
```

**Requirements**: 9.1-9.5

---

## Error Handling Strategy

### Frontend Error Handling

**Pattern for All Components**:
```typescript
loadData(): void {
  this.isLoading = true;
  this.errorMessage = '';
  
  this.service.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (error) => {
      this.errorMessage = 'Failed to load data. Please try again later.';
      this.isLoading = false;
      this.cdr.detectChanges();
      console.error('Error loading data:', error);
    }
  });
}
```

### Backend Error Handling

**Pattern for All Endpoints**:
```javascript
router.get('/endpoint', authMiddleware, async (req, res) => {
  try {
    // Call SAP service
    const result = await soapService.call('ZRFC_SERVICE', params);
    
    // Map data
    const mappedData = result.map(item => ({
      // camelCase mapping
    }));
    
    res.json({ success: true, data: mappedData });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'User-friendly error message'
    });
  }
});
```

**Requirements**: 11.1-11.5

---

## Testing Strategy

### Component Testing Checklist

**Dashboard**:
- [ ] KPI cards display correct counts
- [ ] Loading spinner shows during data fetch
- [ ] Error message displays on failure
- [ ] Retry button works
- [ ] Quick Access cards display horizontally
- [ ] Data appears immediately (no double-click needed)

**Finance Sheet**:
- [ ] All 4 tabs render correctly
- [ ] Tab switching works
- [ ] Each tab loads appropriate data
- [ ] Invoice tab shows invoice list
- [ ] Credit/Debit tab shows memos
- [ ] Aging tab shows aging buckets
- [ ] Overall Sales tab shows sales records

**Inquiry List**:
- [ ] Table displays with correct columns
- [ ] Data loads from API
- [ ] Currency formatting works
- [ ] Date formatting works
- [ ] Loading spinner shows
- [ ] Error handling works

**Navigation**:
- [ ] Payment links removed
- [ ] Finance Sheet link present
- [ ] Inquiries renamed correctly
- [ ] Navigation order correct
- [ ] All links navigate properly

### API Testing Checklist

- [ ] GET /api/dashboard/stats returns 5 counts
- [ ] GET /api/inquiries returns inquiry list
- [ ] GET /api/invoices returns invoice list
- [ ] GET /api/memos returns memo list
- [ ] GET /api/aging/summary returns aging data
- [ ] GET /api/sales/overall returns sales data
- [ ] All endpoints require authentication
- [ ] All endpoints return camelCase properties
- [ ] Error responses are user-friendly

**Requirements**: 12.1-12.6

