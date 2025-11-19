# Design Document

## Overview

This design document describes the refactoring of the Customer Portal's navigation structure and core components. The refactoring removes payment features from navigation, converts the inquiry form to a data list, creates a dedicated Finance Sheet page, and simplifies the dashboard layout.

### Refactoring Goals

1. **Remove Payment Features**: Hide payment-related navigation links while preserving code for future use
2. **Rename Navigation**: Update "Inquiry Form" to "Inquiries" to reflect data display functionality
3. **Promote Finance Sheet**: Move financial tabs from dashboard to dedicated top-level page
4. **Convert Inquiry Form**: Replace form with data table displaying inquiry records from SAP
5. **Simplify Dashboard**: Remove tab group, keep only KPI cards and quick access links

### Technology Stack

- **Frontend**: Angular 15+ with Material Design
- **Backend**: Node.js Express middleware with RFC connection to SAP
- **SAP Integration**: ZFM_CUST_INQUIRY_RP_863 function module for inquiry data

## Architecture

### Component Structure Changes

```
BEFORE:
src/app/
├── dashboard/
│   └── dashboard.component (KPI cards + Finance Sheet tabs + Quick Access)
├── inquiry/
│   └── inquiry-form.component (Form for submitting inquiries)
└── shared/
    └── sidebar.component (Navigation with Payment links)

AFTER:
src/app/
├── dashboard/
│   └── dashboard.component (KPI cards + Quick Access only)
├── finance/                           [NEW MODULE]
│   ├── finance.module.ts
│   ├── finance-routing.module.ts
│   └── finance-sheet.component (Finance Sheet tabs moved here)
├── inquiry/
│   └── inquiry-list.component (Table displaying inquiry data)
└── shared/
    └── sidebar.component (Updated navigation without Payment)
```


### Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    SIDEBAR NAVIGATION                    │
│                                                          │
│  [Dashboard]           → /dashboard                      │
│  [Finance Sheet] NEW   → /finance                        │
│  [Invoice]             → /invoice                        │
│  [Delivery]            → /delivery                       │
│  [Inquiries] RENAMED   → /inquiry                        │
│  [Sales Orders]        → /inquiry/sales-orders           │
│  [Credit/Debit]        → /invoice/credit-debit           │
│  [Profile]             → /profile                        │
│                                                          │
│  REMOVED: Payment List, Payment Form                     │
└─────────────────────────────────────────────────────────┘
```

### Page Layout Changes

**Dashboard (Before)**:
```
┌─────────────────────────────────────────────────────────┐
│ KPI Cards (5 cards in row)                              │
├─────────────────────────────────────────────────────────┤
│ Finance Sheet Tabs                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Invoice] [Credit/Debit] [Aging] [Overall Sales]    │ │
│ │                                                      │ │
│ │ Tab Content (Invoice List, etc.)                    │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Quick Access Links (4 cards)                            │
└─────────────────────────────────────────────────────────┘
```

**Dashboard (After)**:
```
┌─────────────────────────────────────────────────────────┐
│ KPI Cards (5 cards in row)                              │
├─────────────────────────────────────────────────────────┤
│ Quick Access Links (4 cards)                            │
└─────────────────────────────────────────────────────────┘
```

**Finance Sheet Page (New)**:
```
┌─────────────────────────────────────────────────────────┐
│ Finance Sheet                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Invoice] [Credit/Debit] [Aging] [Overall Sales]    │ │
│ │                                                      │ │
│ │ Tab Content (Invoice List, etc.)                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```


## Components and Interfaces

### 1. SidebarComponent (Modified)

**Purpose**: Update navigation menu to reflect new structure

**Changes**:
- Remove "Payment List" and "Payment Form" from navItems array
- Rename "Inquiry Form" to "Inquiries"
- Add "Finance Sheet" navigation item with route "/finance"
- Reorder navItems to match requirement: Dashboard, Finance Sheet, Invoice, Delivery, Inquiries, Sales Orders, Credit/Debit, Profile

**Updated navItems Array**:
```typescript
navItems: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Finance Sheet', route: '/finance', icon: 'account_balance' },
  { label: 'Invoice', route: '/invoice', icon: 'receipt' },
  { label: 'Delivery', route: '/delivery', icon: 'local_shipping' },
  { label: 'Inquiries', route: '/inquiry', icon: 'search' },
  { label: 'Sales Orders', route: '/inquiry/sales-orders', icon: 'shopping_cart' },
  { label: 'Credit/Debit', route: '/invoice/credit-debit', icon: 'account_balance_wallet' },
  { label: 'Profile', route: '/profile', icon: 'person' }
];
```

**Requirements**: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.4, 4.1, 4.2

---

### 2. FinanceModule (New)

**Purpose**: Create lazy-loaded module for Finance Sheet functionality

**Module Structure**:
```typescript
@NgModule({
  declarations: [FinanceSheetComponent],
  imports: [
    CommonModule,
    FinanceRoutingModule,
    MatTabsModule,
    MatCardModule,
    InvoiceModule,  // For invoice-list component
    SharedModule
  ]
})
export class FinanceModule { }
```

**Routing Configuration**:
```typescript
const routes: Routes = [
  { path: '', component: FinanceSheetComponent }
];
```

**Requirements**: 5.1, 5.2, 5.4, 5.5

---

### 3. FinanceSheetComponent (New)

**Purpose**: Display financial data tabs in dedicated page

**Template Structure**:
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

**Component Logic**:
```typescript
@Component({
  selector: 'app-finance-sheet',
  templateUrl: './finance-sheet.component.html',
  styleUrls: ['./finance-sheet.component.css']
})
export class FinanceSheetComponent {
  // No additional logic needed - child components handle their own data
}
```

**Requirements**: 5.3, 6.1, 6.2, 6.3, 6.4

---


### 4. DashboardComponent (Modified)

**Purpose**: Simplify dashboard by removing Finance Sheet tabs

**Changes**:
- Remove entire `<div class="finance-sheet-section">` containing mat-tab-group
- Keep KPI cards section
- Keep Quick Access section
- Update component logic if needed to remove any Finance Sheet-specific data loading

**Updated Template Structure**:
```html
<div class="dashboard-container">
  <h1>Dashboard</h1>
  
  <!-- Loading Spinner -->
  <div class="loading-container" *ngIf="isLoading">
    <mat-spinner></mat-spinner>
    <p>Loading dashboard data...</p>
  </div>

  <!-- Error Message -->
  <div *ngIf="errorMessage && !isLoading" class="error-container">
    <mat-card class="error-card">
      <mat-card-content>
        <p class="error-message">{{ errorMessage }}</p>
        <button mat-button color="primary" (click)="retryLoad()">Retry</button>
      </mat-card-content>
    </mat-card>
  </div>

  <!-- Dashboard Content -->
  <div *ngIf="!isLoading && !errorMessage">
    <!-- KPI Cards -->
    <div class="kpi-section">
      <!-- 5 KPI cards remain unchanged -->
    </div>

    <!-- Quick Access Links -->
    <div class="quick-links-section">
      <h2>Quick Access</h2>
      <div class="quick-links-container">
        <!-- 4 quick access cards remain unchanged -->
      </div>
    </div>
  </div>
</div>
```

**Requirements**: 6.1, 6.2, 9.1, 9.2, 9.3, 9.4

---

### 5. InquiryListComponent (New/Refactored)

**Purpose**: Display inquiry data from SAP in table format

**Approach**: Create new component or refactor existing InquiryFormComponent

**Template Structure**:
```html
<div class="inquiry-list-container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Inquiries</mat-card-title>
      <mat-card-subtitle>View inquiry records from SAP</mat-card-subtitle>
    </mat-card-header>

    <mat-card-content>
      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
        <p>Loading inquiries...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage && !isLoading" class="error-container">
        <p class="error-message">{{ errorMessage }}</p>
        <button mat-button color="primary" (click)="loadInquiries()">Retry</button>
      </div>

      <!-- Inquiry Table -->
      <table mat-table [dataSource]="inquiries" *ngIf="!isLoading && !errorMessage" class="inquiry-table">
        
        <ng-container matColumnDef="documentNumber">
          <th mat-header-cell *matHeaderCellDef>Document Number</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.documentNumber }}</td>
        </ng-container>

        <ng-container matColumnDef="creationDate">
          <th mat-header-cell *matHeaderCellDef>Creation Date</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.creationDate | date:'MM/dd/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="createdBy">
          <th mat-header-cell *matHeaderCellDef>Created By</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.createdBy }}</td>
        </ng-container>

        <ng-container matColumnDef="materialDescription">
          <th mat-header-cell *matHeaderCellDef>Material Description</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.materialDescription }}</td>
        </ng-container>

        <ng-container matColumnDef="netValue">
          <th mat-header-cell *matHeaderCellDef>Net Value</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.netValue | currency:inquiry.currency }}</td>
        </ng-container>

        <ng-container matColumnDef="currency">
          <th mat-header-cell *matHeaderCellDef>Currency</th>
          <td mat-cell *matCellDef="let inquiry">{{ inquiry.currency }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <!-- No Data Message -->
      <div *ngIf="!isLoading && !errorMessage && inquiries.length === 0" class="no-data">
        <p>No inquiries found.</p>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```


**Component Logic**:
```typescript
export interface Inquiry {
  documentNumber: string;
  creationDate: string;
  createdBy: string;
  materialDescription: string;
  netValue: number;
  currency: string;
}

@Component({
  selector: 'app-inquiry-list',
  templateUrl: './inquiry-list.component.html',
  styleUrls: ['./inquiry-list.component.css']
})
export class InquiryListComponent implements OnInit {
  inquiries: Inquiry[] = [];
  displayedColumns: string[] = ['documentNumber', 'creationDate', 'createdBy', 'materialDescription', 'netValue', 'currency'];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private inquiryService: InquiryService) {}

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
      },
      error: (error) => {
        this.errorMessage = 'Failed to load inquiries. Please try again later.';
        this.isLoading = false;
        console.error('Error loading inquiries:', error);
      }
    });
  }
}
```

**Requirements**: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6

---

### 6. InquiryService (Modified)

**Purpose**: Add method to retrieve inquiry data from API

**New Method**:
```typescript
getInquiries(): Observable<Inquiry[]> {
  return this.apiService.get<Inquiry[]>('/inquiries');
}
```

**Requirements**: 7.3, 7.4

---

## Backend API Design

### Inquiry API Endpoint

**Endpoint**: `GET /api/inquiries`

**Purpose**: Retrieve inquiry data from SAP function module ZFM_CUST_INQUIRY_RP_863

**Authentication**: JWT token required (Bearer authentication)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "inquiries": [
    {
      "documentNumber": "INQ001",
      "creationDate": "2025-05-15",
      "createdBy": "JOHN.DOE",
      "materialDescription": "Product A - High Quality",
      "netValue": 1500.00,
      "currency": "USD"
    },
    {
      "documentNumber": "INQ002",
      "creationDate": "2025-05-16",
      "createdBy": "JANE.SMITH",
      "materialDescription": "Product B - Premium",
      "netValue": 2500.00,
      "currency": "USD"
    }
  ]
}
```

**Response (Error - 500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Failed to retrieve inquiry data from SAP"
}
```

**Response (Error - 401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```


### Middleware Implementation

**File**: `middleware/routes/inquiry.routes.js`

**New Route Handler**:
```javascript
router.get('/inquiries', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId; // From JWT token
    
    // Call SAP RFC function
    const result = await rfcCallService.callRfcFunction('ZFM_CUST_INQUIRY_RP_863', {
      IV_CUSTOMER_ID: customerId
    });
    
    // Check SY-SUBRC
    if (result.SY_SUBRC !== 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve inquiry data from SAP'
      });
    }
    
    // Map SAP response to frontend format
    const inquiries = result.ET_INQUIRIES.map(inquiry => ({
      documentNumber: inquiry.DOCUMENT_NUMBER,
      creationDate: inquiry.CREATION_DATE,
      createdBy: inquiry.CREATED_BY,
      materialDescription: inquiry.MATERIAL_DESC,
      netValue: parseFloat(inquiry.NET_VALUE),
      currency: inquiry.CURRENCY
    }));
    
    res.json({
      success: true,
      inquiries: inquiries
    });
    
  } catch (error) {
    console.error('Error calling ZFM_CUST_INQUIRY_RP_863:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve inquiry data from SAP'
    });
  }
});
```

**Requirements**: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6

---

## Routing Configuration

### App Routes Update

**File**: `src/app/app.routes.ts`

**Changes**:
1. Add new lazy-loaded route for Finance module
2. Comment out payment module route (preserve for future use)

**Updated Routes**:
```typescript
export const routes: Routes = [
  { path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadChildren: () => import('./dashboard/dashboard-module').then(m => m.DashboardModule)
      },
      { 
        path: 'finance',  // NEW ROUTE
        loadChildren: () => import('./finance/finance.module').then(m => m.FinanceModule)
      },
      { 
        path: 'invoice', 
        loadChildren: () => import('./invoice/invoice-module').then(m => m.InvoiceModule)
      },
      // COMMENTED OUT - Payment features disabled but preserved for future use
      // { 
      //   path: 'payment', 
      //   loadChildren: () => import('./payment/payment-module').then(m => m.PaymentModule)
      // },
      { 
        path: 'delivery', 
        loadChildren: () => import('./delivery/delivery-module').then(m => m.DeliveryModule)
      },
      { 
        path: 'profile', 
        loadChildren: () => import('./profile/profile-module').then(m => m.ProfileModule)
      },
      { 
        path: 'inquiry', 
        loadChildren: () => import('./inquiry/inquiry-module').then(m => m.InquiryModule)
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
```

**Requirements**: 1.4, 5.4, 5.5, 10.1, 10.2, 10.3, 10.4, 10.5, 12.4

---


### Inquiry Module Routes Update

**File**: `src/app/inquiry/inquiry-routing.module.ts`

**Changes**: Update default route to point to inquiry list instead of form

**Updated Routes**:
```typescript
const routes: Routes = [
  { path: '', component: InquiryListComponent },  // Changed from InquiryFormComponent
  { path: 'sales-orders', component: SalesOrderListComponent },
  { path: 'sales-orders/:id', component: SalesOrderDetailComponent }
];
```

**Requirements**: 7.1, 7.2

---

## Data Models

### Inquiry Interface

**File**: `src/app/inquiry/inquiry.ts`

**New Interface**:
```typescript
export interface Inquiry {
  documentNumber: string;
  creationDate: string;  // ISO date format
  createdBy: string;
  materialDescription: string;
  netValue: number;
  currency: string;
}
```

**Requirements**: 7.4

---

## Error Handling

### Frontend Error Handling

**Inquiry List Component**:
- Display loading spinner while fetching data
- Show error message if API call fails
- Provide retry button to re-attempt data loading
- Display "No inquiries found" message if data array is empty

**Error Message**: "Failed to load inquiries. Please try again later."

**Requirements**: 7.6, 11.3

### Backend Error Handling

**Inquiry API Endpoint**:
- Catch RFC connection errors
- Check SY-SUBRC return code from SAP function
- Return HTTP 500 with generic error message
- Log detailed error to console without exposing to client

**Requirements**: 8.4, 8.5, 11.3

---

## Testing Strategy

### Manual Testing Checklist

**Navigation Testing**:
- [ ] Verify "Payment List" and "Payment Form" links are removed from sidebar
- [ ] Verify "Inquiry Form" is renamed to "Inquiries"
- [ ] Verify "Finance Sheet" link appears in sidebar with correct icon
- [ ] Verify navigation order matches requirement
- [ ] Verify active route highlighting works for all links
- [ ] Verify clicking Finance Sheet navigates to /finance route

**Finance Sheet Testing**:
- [ ] Verify Finance Sheet page loads successfully
- [ ] Verify all four tabs (Invoice, Credit/Debit, Aging, Overall Sales) are present
- [ ] Verify tab content displays correctly
- [ ] Verify tab switching works properly
- [ ] Verify Finance Sheet functionality matches previous dashboard implementation

**Dashboard Testing**:
- [ ] Verify Finance Sheet tabs are removed from dashboard
- [ ] Verify KPI cards still display correctly
- [ ] Verify Quick Access section still displays correctly
- [ ] Verify dashboard loads within 3 seconds

**Inquiry List Testing**:
- [ ] Verify inquiry list page displays table instead of form
- [ ] Verify table columns match requirement (Document Number, Creation Date, Created By, Material Description, Net Value, Currency)
- [ ] Verify data loads from API successfully
- [ ] Verify loading spinner displays during data fetch
- [ ] Verify error message displays if API call fails
- [ ] Verify retry button works correctly
- [ ] Verify "No inquiries found" message displays when data is empty
- [ ] Verify currency formatting displays correctly

**Routing Testing**:
- [ ] Verify /finance route loads Finance Sheet page
- [ ] Verify /inquiry route loads Inquiry List page
- [ ] Verify direct navigation to /payment routes redirects to dashboard
- [ ] Verify AuthGuard protects /finance route
- [ ] Verify lazy loading works for Finance module

**Backend API Testing**:
- [ ] Verify GET /api/inquiries endpoint exists
- [ ] Verify endpoint requires JWT authentication
- [ ] Verify endpoint calls ZFM_CUST_INQUIRY_RP_863 function
- [ ] Verify endpoint returns inquiry data in correct format
- [ ] Verify endpoint handles SAP errors gracefully
- [ ] Verify endpoint returns HTTP 500 on error

**Regression Testing**:
- [ ] Verify Invoice module still works correctly
- [ ] Verify Delivery module still works correctly
- [ ] Verify Sales Orders still work correctly
- [ ] Verify Credit/Debit still works correctly
- [ ] Verify Profile module still works correctly
- [ ] Verify authentication still works correctly

---

## Implementation Notes

### Code Preservation

**Payment Module**:
- Do NOT delete any payment-related files
- Comment out payment routes in app.routes.ts
- Add comment: "// Payment features disabled but preserved for future use"
- Keep PaymentModule, PaymentListComponent, PaymentFormComponent intact
- Keep payment API endpoints in middleware but they won't be accessible from frontend

**Requirements**: 12.1, 12.2, 12.3, 12.4, 12.5

### Migration Strategy

**Phase 1**: Update Navigation
- Modify SidebarComponent navItems array
- Test navigation changes

**Phase 2**: Create Finance Module
- Generate FinanceModule and FinanceSheetComponent
- Add routing configuration
- Test Finance Sheet page loads

**Phase 3**: Move Finance Sheet Content
- Copy mat-tab-group from dashboard.component.html
- Paste into finance-sheet.component.html
- Remove from dashboard.component.html
- Test both pages

**Phase 4**: Convert Inquiry Form
- Create InquiryListComponent
- Implement table template
- Update inquiry routing
- Test inquiry list displays

**Phase 5**: Implement Inquiry API
- Add GET /api/inquiries endpoint in middleware
- Implement RFC call to ZFM_CUST_INQUIRY_RP_863
- Test API endpoint
- Connect frontend to API

**Phase 6**: Testing and Validation
- Perform comprehensive testing
- Verify all requirements met
- Fix any issues found

**Requirements**: 11.1, 11.2, 11.3, 11.4

---

## Performance Considerations

- Finance Sheet lazy loading ensures initial page load is not impacted
- Inquiry list data fetching should complete within 2-3 seconds
- Dashboard simplification reduces initial render time
- Existing component functionality remains unchanged to avoid performance regressions

**Requirements**: 9.5

---

## Security Considerations

- Finance Sheet route protected by AuthGuard
- Inquiry API endpoint requires JWT authentication
- Customer ID extracted from JWT token to ensure data isolation
- No sensitive data exposed in error messages

**Requirements**: 5.5, 8.6

