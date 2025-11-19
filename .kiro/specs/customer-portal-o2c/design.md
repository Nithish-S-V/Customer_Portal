# Design Document

## Overview

This design document describes the architecture and implementation approach for the Customer Portal O2C (Order-to-Cash) system. The portal is a practice/learning project that follows pragmatic development principles, implementing core MUST-HAVE features without enterprise-scale complexity.

### System Purpose

The Customer Portal enables customers to:
- Authenticate and access their financial information securely
- View dashboard with KPI cards and recent invoices
- Browse and search invoice lists with pagination
- Generate and view invoice PDF forms using SAP Smart Forms
- Process payments and view payment history
- Track credit/debit notes and deliveries
- Manage customer profile information
- Submit inquiries and track sales orders

### Technology Stack

- **Frontend**: Angular 15+ with Material Design components
- **Middleware**: Node.js Express server with node-rfc library
- **Backend**: SAP ERP on-premise with ABAP function modules
- **Integration**: RFC protocol for binary communication
- **Security**: HTTPS/TLS with JWT token authentication
- **Deployment**: On-premise (no SAP Cloud Connector needed)

### Key Design Principles

1. **Pragmatic Simplicity**: Implement only essential features, skip advanced enterprise patterns
2. **Generic Data Types**: Use ABAP generic types (C, N, P, D) instead of Data Dictionary types
3. **Connection Pooling**: Maintain 5 RFC connections for performance
4. **Stateless Authentication**: JWT tokens with 8-hour expiry
5. **Lazy Loading**: Load Angular modules on-demand for faster initial load
6. **User-Friendly Errors**: Transform technical errors into actionable messages

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ANGULAR FRONTEND                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Components: Login, Dashboard, Invoice, Payment  │  │
│  │  Services: ApiService, InvoiceService, AuthService│  │
│  │  Routing: Lazy-loaded feature modules            │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                  HTTPS/TLS (Port 443)
                  REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────┐
│              NODE.JS RFC MIDDLEWARE                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Express Server (Port 3443)                      │  │
│  │  JWT Authentication Middleware                   │  │
│  │  RFC Connection Pool (5 connections)             │  │
│  │  API Endpoints: /api/auth, /api/invoice, etc.   │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                  RFC Protocol (Port 3200)
                  Binary Communication
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 SAP ERP BACKEND                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ABAP Function Modules (Z_*)                     │  │
│  │  Smart Forms (ZSF_INVOICE)                       │  │
│  │  Database Tables (ZINVOICES, ZCUSTOMERS, etc.)  │  │
│  │  BAPIs for Payment Processing                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```


### Component Architecture

#### Angular Frontend Structure

```
src/app/
├── app.module.ts                    # Root module
├── app-routing.module.ts            # Routing configuration
├── app.component.ts                 # Root component
│
├── auth/                            # Authentication module (not lazy loaded)
│   ├── auth.module.ts
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.css
│   └── auth.service.ts              # JWT token management
│
├── dashboard/                       # Dashboard module (eager loaded)
│   ├── dashboard.module.ts
│   ├── dashboard.component.ts       # KPI cards + recent invoices
│   ├── dashboard.component.html
│   └── dashboard.component.css
│
├── invoice/                         # Invoice module (lazy loaded)
│   ├── invoice.module.ts
│   ├── invoice-routing.module.ts
│   ├── invoice-list/
│   │   ├── invoice-list.component.ts
│   │   ├── invoice-list.component.html
│   │   └── invoice-list.component.css
│   ├── invoice-detail/
│   │   ├── invoice-detail.component.ts
│   │   ├── invoice-detail.component.html
│   │   └── invoice-detail.component.css
│   └── invoice.service.ts           # Invoice API calls
│
├── payment/                         # Payment module (lazy loaded)
│   ├── payment.module.ts
│   ├── payment-routing.module.ts
│   ├── payment-list/
│   │   └── payment-list.component.ts
│   ├── payment-form/
│   │   └── payment-form.component.ts
│   └── payment.service.ts
│
├── delivery/                        # Delivery module (lazy loaded)
│   ├── delivery.module.ts
│   ├── delivery-routing.module.ts
│   ├── delivery-list/
│   │   └── delivery-list.component.ts
│   ├── delivery-detail/
│   │   └── delivery-detail.component.ts
│   └── delivery.service.ts
│
├── profile/                         # Profile module (lazy loaded)
│   ├── profile.module.ts
│   ├── profile-routing.module.ts
│   ├── profile-view/
│   │   └── profile-view.component.ts
│   ├── profile-edit/
│   │   └── profile-edit.component.ts
│   └── profile.service.ts
│
├── inquiry/                         # Inquiry module (lazy loaded)
│   ├── inquiry.module.ts
│   ├── inquiry-routing.module.ts
│   ├── inquiry-form/
│   │   └── inquiry-form.component.ts
│   ├── sales-order-list/
│   │   └── sales-order-list.component.ts
│   ├── sales-order-detail/
│   │   └── sales-order-detail.component.ts
│   └── inquiry.service.ts
│
└── shared/                          # Shared module
    ├── shared.module.ts
    ├── components/
    │   ├── navbar/
    │   │   ├── navbar.component.ts
    │   │   ├── navbar.component.html
    │   │   └── navbar.component.css
    │   └── sidebar/
    │       ├── sidebar.component.ts
    │       ├── sidebar.component.html
    │       └── sidebar.component.css
    ├── services/
    │   └── api.service.ts           # HTTP client wrapper
    └── models/
        ├── invoice.model.ts
        ├── payment.model.ts
        └── customer.model.ts
```


#### Node.js Middleware Structure

```
middleware/
├── server.js                        # Express server entry point
├── config/
│   ├── rfc-config.js                # SAP RFC connection parameters
│   ├── jwt-config.js                # JWT secret and expiry settings
│   └── https-config.js              # SSL certificate paths
├── routes/
│   ├── auth.routes.js               # /api/auth endpoints
│   ├── invoice.routes.js            # /api/invoice endpoints
│   ├── payment.routes.js            # /api/payment endpoints
│   ├── delivery.routes.js           # /api/delivery endpoints
│   ├── profile.routes.js            # /api/profile endpoints
│   └── inquiry.routes.js            # /api/inquiry endpoints
├── middleware/
│   ├── auth.middleware.js           # JWT token validation
│   ├── rbac.middleware.js           # Role-based access control
│   └── error.middleware.js          # Error handling
├── services/
│   ├── rfc-pool.service.js          # RFC connection pool management
│   └── rfc-call.service.js          # RFC function call wrapper
└── utils/
    ├── logger.js                    # Console logging utility
    └── error-mapper.js              # Map ABAP errors to HTTP responses
```

#### SAP ABAP Backend Structure

```
SAP System (Transaction SE80)
├── Function Groups
│   ├── ZCUSTPRTL_AUTH               # Authentication functions
│   │   └── Z_RFC_VALIDATE_USER
│   ├── ZCUSTPRTL_INVOICE            # Invoice functions
│   │   ├── Z_INVOICE_GET_LIST
│   │   ├── Z_INVOICE_GET_DETAILS
│   │   ├── Z_INVOICE_GET_STATS
│   │   └── Z_INVOICE_CREATE_FORM
│   ├── ZCUSTPRTL_PAYMENT            # Payment functions
│   │   ├── Z_PAYMENT_GET_LIST
│   │   └── Z_PAYMENT_PROCESS
│   ├── ZCUSTPRTL_DELIVERY           # Delivery functions
│   │   ├── Z_DELIVERY_GET_LIST
│   │   ├── Z_DELIVERY_GET_DETAILS
│   │   └── Z_DELIVERY_CREATE_FORM
│   ├── ZCUSTPRTL_CUSTOMER           # Customer functions
│   │   ├── Z_CUSTOMER_GET_PROFILE
│   │   └── Z_CUSTOMER_UPDATE_PROFILE
│   ├── ZCUSTPRTL_INQUIRY            # Inquiry functions
│   │   ├── Z_INQUIRY_CREATE
│   │   ├── Z_SALESORDER_GET_LIST
│   │   └── Z_SALESORDER_GET_DETAILS
│   └── ZCUSTPRTL_CREDITDEBIT        # Credit/Debit functions
│       ├── Z_CREDITDEBIT_GET_LIST
│       └── Z_CREDITDEBIT_GET_DETAILS
│
├── Smart Forms (Transaction SMARTFORMS)
│   ├── ZSF_INVOICE                  # Invoice PDF template
│   └── ZSF_DELIVERY                 # Delivery document template
│
├── Database Tables (Transaction SE11)
│   ├── ZINVOICES                    # Invoice header table
│   ├── ZINVOICE_ITEMS               # Invoice line items
│   ├── ZPAYMENTS                    # Payment records
│   ├── ZCUSTOMERS                   # Customer master data
│   ├── ZDELIVERIES                  # Delivery header
│   ├── ZDELIVERY_ITEMS              # Delivery line items
│   ├── ZINQUIRIES                   # Customer inquiries
│   └── ZSALES_ORDERS                # Sales order data
│
└── Exception Classes (Transaction SE24)
    ├── ZCX_INVOICE_ERROR            # Invoice-related exceptions
    ├── ZCX_PAYMENT_ERROR            # Payment-related exceptions
    ├── ZCX_NO_AUTHORIZATION         # Authorization exceptions
    └── ZCX_DB_ERROR                 # Database exceptions
```


## Components and Interfaces

### Frontend Components

#### 1. LoginComponent

**Purpose**: Authenticate users and generate JWT tokens

**Template Elements**:
- Username input field (mat-form-field)
- Password input field (mat-form-field with type="password")
- Login button (mat-button)
- Error message display area

**Component Logic**:
```typescript
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.isLoading = true;
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (response) => {
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('user_role', response.role);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = 'Invalid credentials. Please try again.';
          this.isLoading = false;
        }
      });
  }
}
```

#### 2. DashboardComponent

**Purpose**: Display KPI cards and recent invoices

**Template Elements**:
- Four KPI cards (mat-card) for Total Invoices, Total Amount, Paid Amount, Pending Amount
- Recent invoices grid (mat-card for each invoice)
- Tabs for Invoice, Credit/Debit, Aging, Overall Sales
- Loading spinner (mat-spinner)

**Component Logic**:
```typescript
export class DashboardComponent implements OnInit {
  invoiceStats = {
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  };
  recentInvoices: Invoice[] = [];
  isLoading: boolean = true;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    forkJoin({
      stats: this.invoiceService.getInvoiceStats(),
      recent: this.invoiceService.getRecentInvoices(5)
    }).subscribe({
      next: (data) => {
        this.invoiceStats = data.stats;
        this.recentInvoices = data.recent;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard data', error);
        this.isLoading = false;
      }
    });
  }

  onInvoiceClick(invoiceId: string): void {
    this.invoiceService.generateInvoiceForm(invoiceId)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (error) => {
          console.error('Failed to generate invoice form', error);
        }
      });
  }
}
```


#### 3. InvoiceListComponent

**Purpose**: Display paginated invoice list with search

**Template Elements**:
- Search input field (mat-form-field)
- Invoice table (mat-table) with columns: Invoice Number, Amount, Date, Due Date, Status, Actions
- Pagination controls (Previous/Next buttons)
- Loading spinner (mat-spinner)

**Component Logic**:
```typescript
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  totalCount: number = 0;
  pageSize: number = 50;
  currentPage: number = 0;
  searchText: string = '';
  isLoading: boolean = false;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    const skip = this.currentPage * this.pageSize;
    
    this.invoiceService.getInvoiceList(skip, this.pageSize)
      .subscribe({
        next: (response) => {
          this.invoices = response.invoices;
          this.totalCount = response.totalCount;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load invoices', error);
          this.isLoading = false;
        }
      });
  }

  onNextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.loadInvoices();
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadInvoices();
    }
  }

  onSearch(): void {
    this.currentPage = 0;
    this.invoices = this.invoices.filter(inv => 
      inv.invoiceNumber.includes(this.searchText)
    );
  }

  onViewForm(invoiceId: string): void {
    this.invoiceService.generateInvoiceForm(invoiceId)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        }
      });
  }
}
```

#### 4. PaymentFormComponent

**Purpose**: Process new payments

**Template Elements**:
- Invoice selection dropdown (mat-select)
- Payment amount input (mat-form-field with type="number")
- Payment method selection (mat-radio-group)
- Submit button (mat-button)
- Validation error messages

**Component Logic**:
```typescript
export class PaymentFormComponent implements OnInit {
  invoices: Invoice[] = [];
  selectedInvoiceId: string = '';
  paymentAmount: number = 0;
  paymentMethod: string = 'CREDIT_CARD';
  errorMessage: string = '';

  constructor(
    private paymentService: PaymentService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadUnpaidInvoices();
  }

  loadUnpaidInvoices(): void {
    this.invoiceService.getUnpaidInvoices()
      .subscribe({
        next: (invoices) => {
          this.invoices = invoices;
        }
      });
  }

  onSubmit(): void {
    if (this.paymentAmount <= 0) {
      this.errorMessage = 'Payment amount must be greater than 0';
      return;
    }

    const selectedInvoice = this.invoices.find(
      inv => inv.invoiceNumber === this.selectedInvoiceId
    );

    if (this.paymentAmount > selectedInvoice.balance) {
      this.errorMessage = 'Payment amount exceeds invoice balance';
      return;
    }

    this.paymentService.processPayment({
      invoiceId: this.selectedInvoiceId,
      amount: this.paymentAmount,
      method: this.paymentMethod
    }).subscribe({
      next: (response) => {
        alert('Payment processed successfully');
        this.resetForm();
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Payment failed';
      }
    });
  }

  resetForm(): void {
    this.selectedInvoiceId = '';
    this.paymentAmount = 0;
    this.errorMessage = '';
  }
}
```


### Backend API Endpoints

#### Authentication Endpoints

**POST /api/auth/login**
- **Purpose**: Validate user credentials and generate JWT token
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "Admin",
    "username": "john.doe"
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Invalid credentials"
  }
  ```
- **RFC Call**: Z_RFC_VALIDATE_USER(IV_USERNAME, IV_PASSWORD) → EV_VALID, EV_ROLE

**POST /api/auth/logout**
- **Purpose**: Clear session (client-side token removal)
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### Invoice Endpoints

**GET /api/invoice/list?skip=0&top=50**
- **Purpose**: Retrieve paginated invoice list
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - skip: number (default 0)
  - top: number (default 50)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "invoices": [
      {
        "invoiceNumber": "90000010",
        "customerId": "1000",
        "customerName": "STACY'S",
        "amount": 1500.00,
        "currency": "USD",
        "date": "2025-05-18",
        "dueDate": "2025-06-18",
        "status": "Open"
      }
    ],
    "totalCount": 150
  }
  ```
- **RFC Call**: Z_INVOICE_GET_LIST(IV_CUSTOMER_ID, IV_SKIP, IV_TOP) → ET_INVOICES, EV_TOTAL_COUNT

**GET /api/invoice/:id**
- **Purpose**: Retrieve invoice details with line items
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "invoice": {
      "invoiceNumber": "90000010",
      "customerId": "1000",
      "customerName": "STACY'S",
      "amount": 1500.00,
      "currency": "USD",
      "date": "2025-05-18",
      "dueDate": "2025-06-18",
      "status": "Open",
      "lineItems": [
        {
          "itemNumber": 1,
          "productCode": "PROD001",
          "description": "Product A",
          "quantity": 10,
          "unitPrice": 100.00,
          "totalPrice": 1000.00,
          "tax": 100.00
        }
      ]
    }
  }
  ```
- **RFC Call**: Z_INVOICE_GET_DETAILS(IV_INVOICE_ID) → EV_TOTAL_AMOUNT, ET_LINE_ITEMS

**GET /api/invoice/:id/form**
- **Purpose**: Generate and download invoice PDF
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**: PDF blob (Content-Type: application/pdf)
- **Response (500 Error)**:
  ```json
  {
    "success": false,
    "error": "Failed to generate form. Smart Form template may not exist."
  }
  ```
- **RFC Call**: Z_INVOICE_CREATE_FORM(IV_INVOICE_ID) → EV_PDF_BLOB

**GET /api/invoice/stats**
- **Purpose**: Retrieve dashboard KPI statistics
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalInvoices": 150,
      "totalAmount": 250000.00,
      "paidAmount": 180000.00,
      "pendingAmount": 70000.00
    }
  }
  ```
- **RFC Call**: Z_INVOICE_GET_STATS(IV_CUSTOMER_ID) → EV_TOTAL_COUNT, EV_TOTAL_AMOUNT, EV_PAID_AMOUNT, EV_PENDING_AMOUNT


#### Payment Endpoints

**GET /api/payment/list**
- **Purpose**: Retrieve payment history
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "payments": [
      {
        "paymentNumber": "PAY001",
        "invoiceReference": "90000010",
        "amount": 1500.00,
        "currency": "USD",
        "paymentDate": "2025-05-20",
        "paymentMethod": "CREDIT_CARD",
        "status": "Completed"
      }
    ]
  }
  ```
- **RFC Call**: Z_PAYMENT_GET_LIST(IV_CUSTOMER_ID) → ET_PAYMENTS

**POST /api/payment/process**
- **Purpose**: Process new payment
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "invoiceId": "90000010",
    "amount": 1500.00,
    "method": "CREDIT_CARD"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "paymentNumber": "PAY001",
    "message": "Payment processed successfully"
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Payment amount exceeds invoice balance"
  }
  ```
- **RFC Calls**: 
  1. Z_INVOICE_GET_DETAILS(IV_INVOICE_ID) → Verify balance
  2. BAPI_PAYMENT_CREATE(...) → Create payment
  3. BAPI_TRANSACTION_COMMIT(WAIT='X') → Commit transaction

#### Delivery Endpoints

**GET /api/delivery/list**
- **Purpose**: Retrieve delivery list
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "deliveries": [
      {
        "deliveryNumber": "DEL001",
        "salesOrderReference": "SO001",
        "deliveryDate": "2025-05-25",
        "status": "In Transit",
        "trackingNumber": "TRACK123"
      }
    ]
  }
  ```
- **RFC Call**: Z_DELIVERY_GET_LIST(IV_CUSTOMER_ID) → ET_DELIVERIES

**GET /api/delivery/:id**
- **Purpose**: Retrieve delivery details
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "delivery": {
      "deliveryNumber": "DEL001",
      "salesOrderReference": "SO001",
      "deliveryDate": "2025-05-25",
      "status": "In Transit",
      "trackingNumber": "TRACK123",
      "lineItems": [
        {
          "itemNumber": 1,
          "productCode": "PROD001",
          "description": "Product A",
          "quantity": 10,
          "shippingInfo": "Warehouse A"
        }
      ]
    }
  }
  ```
- **RFC Call**: Z_DELIVERY_GET_DETAILS(IV_DELIVERY_ID) → ET_LINE_ITEMS

**GET /api/delivery/:id/form**
- **Purpose**: Generate delivery document PDF
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**: PDF blob
- **RFC Call**: Z_DELIVERY_CREATE_FORM(IV_DELIVERY_ID) → EV_PDF_BLOB


#### Profile Endpoints

**GET /api/profile**
- **Purpose**: Retrieve customer profile
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "profile": {
      "customerId": "1000",
      "name": "John Doe",
      "address": "123 Main St",
      "city": "New York",
      "postalCode": "10001",
      "country": "USA",
      "email": "john.doe@example.com",
      "phone": "+1-555-1234",
      "paymentTerms": "Net 30",
      "creditLimit": 50000.00
    }
  }
  ```
- **RFC Call**: Z_CUSTOMER_GET_PROFILE(IV_CUSTOMER_ID) → ES_CUSTOMER

**PUT /api/profile**
- **Purpose**: Update customer profile
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "email": "john.doe@newdomain.com",
    "phone": "+1-555-5678"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully"
  }
  ```
- **RFC Call**: Z_CUSTOMER_UPDATE_PROFILE(IV_CUSTOMER_ID, CS_CUSTOMER) → Check SY-SUBRC

#### Inquiry Endpoints

**POST /api/inquiry/create**
- **Purpose**: Submit new inquiry
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "productCode": "PROD001",
    "quantity": 100,
    "deliveryDate": "2025-06-15",
    "description": "Need urgent delivery"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "inquiryNumber": "INQ001",
    "message": "Inquiry submitted successfully"
  }
  ```
- **RFC Call**: Z_INQUIRY_CREATE(IV_CUSTOMER_ID, IV_PRODUCT_CODE, IV_QUANTITY, IV_DELIVERY_DATE, IV_DESCRIPTION) → EV_INQUIRY_NUMBER

**GET /api/salesorder/list**
- **Purpose**: Retrieve sales order list
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "salesOrders": [
      {
        "orderNumber": "SO001",
        "orderDate": "2025-05-10",
        "deliveryDate": "2025-06-10",
        "totalAmount": 10000.00,
        "status": "In Process"
      }
    ]
  }
  ```
- **RFC Call**: Z_SALESORDER_GET_LIST(IV_CUSTOMER_ID) → ET_SALES_ORDERS

**GET /api/salesorder/:id**
- **Purpose**: Retrieve sales order details
- **Headers**: Authorization: Bearer {token}
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "salesOrder": {
      "orderNumber": "SO001",
      "orderDate": "2025-05-10",
      "deliveryDate": "2025-06-10",
      "totalAmount": 10000.00,
      "status": "In Process",
      "lineItems": [
        {
          "itemNumber": 1,
          "productCode": "PROD001",
          "description": "Product A",
          "quantity": 100,
          "unitPrice": 100.00,
          "totalPrice": 10000.00
        }
      ]
    }
  }
  ```
- **RFC Call**: Z_SALESORDER_GET_DETAILS(IV_ORDER_ID) → ET_LINE_ITEMS


## Data Models

### Frontend TypeScript Models

#### Invoice Model
```typescript
export interface Invoice {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  date: string;  // ISO date format
  dueDate: string;
  status: 'Open' | 'Paid' | 'Overdue' | 'Cancelled';
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  itemNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tax: number;
}
```

#### Payment Model
```typescript
export interface Payment {
  paymentNumber: string;
  invoiceReference: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK' | 'CASH';
  status: 'Pending' | 'Completed' | 'Failed';
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  method: string;
}
```

#### Customer Model
```typescript
export interface Customer {
  customerId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
  paymentTerms: string;
  creditLimit: number;
}
```

#### Delivery Model
```typescript
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
```

#### Sales Order Model
```typescript
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
```

#### Inquiry Model
```typescript
export interface Inquiry {
  inquiryNumber: string;
  productCode: string;
  quantity: number;
  deliveryDate: string;
  description: string;
  status: 'Submitted' | 'Under Review' | 'Quoted' | 'Rejected';
}
```


### ABAP Data Structures

#### Function Module Parameter Types

**Generic Data Types Used**:
- **C(length)**: Character fields (invoice numbers, customer IDs, product codes)
- **N(length)**: Numeric strings (order numbers)
- **P(length) DECIMALS(dec)**: Packed decimal for amounts (e.g., P(15) DECIMALS 2)
- **D**: Date fields (YYYYMMDD format)

#### Example Function Module Signature

```abap
FUNCTION Z_INVOICE_GET_LIST.
*"----------------------------------------------------------------------
*" IMPORTING
*"   IV_CUSTOMER_ID TYPE C(10)
*"   IV_SKIP TYPE I DEFAULT 0
*"   IV_TOP TYPE I DEFAULT 50
*" EXPORTING
*"   EV_TOTAL_COUNT TYPE I
*" TABLES
*"   ET_INVOICES STRUCTURE ZINVOICE_S
*"----------------------------------------------------------------------

  DATA: lt_all_invoices TYPE TABLE OF ZINVOICE_S,
        lv_count TYPE I.

  " Select all invoices for customer
  SELECT * FROM ZINVOICES
    INTO TABLE lt_all_invoices
    WHERE customer_id = IV_CUSTOMER_ID
    ORDER BY invoice_date DESC.

  IF sy-subrc = 0.
    " Get total count
    DESCRIBE TABLE lt_all_invoices LINES EV_TOTAL_COUNT.
    
    " Return paginated slice
    LOOP AT lt_all_invoices INTO DATA(ls_invoice)
      FROM (IV_SKIP + 1) TO (IV_SKIP + IV_TOP).
      APPEND ls_invoice TO ET_INVOICES.
    ENDLOOP.
  ELSE.
    " No invoices found
    EV_TOTAL_COUNT = 0.
  ENDIF.

ENDFUNCTION.
```

#### Database Table Structures

**ZINVOICES Table**:
```abap
@EndUserText.label : 'Invoice Header Table'
@AbapCatalog.enhancementCategory : #NOT_EXTENSIBLE
define table ZINVOICES {
  key invoice_number : C(10);
  customer_id        : C(10);
  customer_name      : C(50);
  amount             : P(15) decimals 2;
  currency           : C(3);
  invoice_date       : D;
  due_date           : D;
  status             : C(20);
  created_by         : C(12);
  created_at         : TIMESTAMP;
}
```

**ZINVOICE_ITEMS Table**:
```abap
define table ZINVOICE_ITEMS {
  key invoice_number : C(10);
  key item_number    : N(6);
  product_code       : C(18);
  description        : C(100);
  quantity           : P(13) decimals 3;
  unit_price         : P(15) decimals 2;
  total_price        : P(15) decimals 2;
  tax                : P(15) decimals 2;
}
```

**ZPAYMENTS Table**:
```abap
define table ZPAYMENTS {
  key payment_number     : C(10);
  invoice_reference      : C(10);
  customer_id            : C(10);
  amount                 : P(15) decimals 2;
  currency               : C(3);
  payment_date           : D;
  payment_method         : C(20);
  status                 : C(20);
  created_by             : C(12);
  created_at             : TIMESTAMP;
}
```

**ZCUSTOMERS Table**:
```abap
define table ZCUSTOMERS {
  key customer_id    : C(10);
  name               : C(100);
  address            : C(200);
  city               : C(50);
  postal_code        : C(10);
  country            : C(3);
  email              : C(100);
  phone              : C(20);
  payment_terms      : C(20);
  credit_limit       : P(15) decimals 2;
  created_by         : C(12);
  created_at         : TIMESTAMP;
}
```


## Error Handling

### Error Handling Strategy

#### Frontend Error Handling

**HTTP Error Interceptor**:
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 401) {
            errorMessage = 'Unauthorized. Please login again.';
            // Redirect to login
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to access this resource.';
          } else if (error.status === 404) {
            errorMessage = 'Resource not found.';
          } else if (error.status === 500) {
            errorMessage = error.error.error || 'System error. Please try again later.';
          } else {
            errorMessage = error.error.error || 'An unexpected error occurred.';
          }
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

**Component Error Display**:
```typescript
export class InvoiceListComponent {
  errorMessage: string = '';
  showRetry: boolean = false;

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.invoiceService.getInvoiceList(this.skip, this.top)
      .subscribe({
        next: (response) => {
          this.invoices = response.invoices;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.showRetry = true;
          this.isLoading = false;
        }
      });
  }

  onRetry(): void {
    this.showRetry = false;
    this.loadInvoices();
  }
}
```

#### Middleware Error Handling

**Error Middleware**:
```javascript
// middleware/error.middleware.js

function errorHandler(err, req, res, next) {
  // Log error with timestamp and endpoint
  const timestamp = new Date().toISOString();
  const username = req.user ? req.user.username : 'anonymous';
  const endpoint = req.originalUrl;
  
  console.error(`[${timestamp}] Error for user ${username} at ${endpoint}:`, err.message);
  
  // Map error to HTTP response
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access'
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  if (err.name === 'RfcError') {
    // RFC-specific error
    if (err.code === 'RFC_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }
    
    // Generic RFC error
    return res.status(500).json({
      success: false,
      error: 'System error. Please try again later.'
    });
  }
  
  // Default error
  return res.status(500).json({
    success: false,
    error: 'An unexpected error occurred'
  });
}

module.exports = errorHandler;
```

**RFC Call Wrapper with Error Handling**:
```javascript
// services/rfc-call.service.js

const rfcPool = require('./rfc-pool.service');

async function callRfcFunction(functionName, parameters) {
  let connection;
  
  try {
    // Acquire connection from pool
    connection = await rfcPool.acquire();
    
    // Call RFC function
    const result = await connection.call(functionName, parameters);
    
    // Check SY-SUBRC
    if (result.SY_SUBRC !== undefined) {
      if (result.SY_SUBRC === 4) {
        // Not found
        const error = new Error('Resource not found');
        error.name = 'RfcError';
        error.code = 'RFC_NOT_FOUND';
        throw error;
      } else if (result.SY_SUBRC !== 0) {
        // Other error
        const error = new Error('RFC call failed');
        error.name = 'RfcError';
        error.code = 'RFC_ERROR';
        throw error;
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`RFC call to ${functionName} failed:`, error.message);
    throw error;
    
  } finally {
    // Always release connection
    if (connection) {
      rfcPool.release(connection);
    }
  }
}

module.exports = { callRfcFunction };
```


#### ABAP Error Handling

**Exception Handling Pattern**:
```abap
FUNCTION Z_INVOICE_GET_DETAILS.
*"----------------------------------------------------------------------
*" IMPORTING
*"   IV_INVOICE_ID TYPE C(10)
*" EXPORTING
*"   EV_TOTAL_AMOUNT TYPE P(15) DECIMALS 2
*" TABLES
*"   ET_LINE_ITEMS STRUCTURE ZINVOICE_ITEM_S
*" RAISING
*"   ZCX_INVOICE_ERROR
*"----------------------------------------------------------------------

  DATA: ls_invoice TYPE ZINVOICE_S,
        lv_timestamp TYPE TIMESTAMP.

  TRY.
    " Get current timestamp for logging
    GET TIME STAMP FIELD lv_timestamp.
    
    " Fetch invoice header
    SELECT SINGLE * FROM ZINVOICES
      INTO ls_invoice
      WHERE invoice_number = IV_INVOICE_ID.

    IF sy-subrc = 0.
      " Invoice found
      EV_TOTAL_AMOUNT = ls_invoice-amount.
      
      " Fetch line items
      SELECT * FROM ZINVOICE_ITEMS
        INTO TABLE ET_LINE_ITEMS
        WHERE invoice_number = IV_INVOICE_ID
        ORDER BY item_number.
      
      " Log success (no sensitive data)
      WRITE: / 'Invoice', IV_INVOICE_ID, 'retrieved at', lv_timestamp.
      
    ELSEIF sy-subrc = 4.
      " Invoice not found
      WRITE: / 'Invoice', IV_INVOICE_ID, 'not found at', lv_timestamp.
      
      RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
        EXPORTING
          textid = ZCX_INVOICE_ERROR=>INVOICE_NOT_FOUND
          invoice_id = IV_INVOICE_ID.
          
    ELSE.
      " Database error
      WRITE: / 'Database error at', lv_timestamp.
      
      RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
        EXPORTING
          textid = ZCX_INVOICE_ERROR=>DATABASE_ERROR.
    ENDIF.

  CATCH CX_SY_OPEN_SQL_DB_ERROR INTO DATA(lx_db_error).
    " Handle database exception
    WRITE: / 'SQL error at', lv_timestamp.
    
    RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
      EXPORTING
        textid = ZCX_INVOICE_ERROR=>DATABASE_ERROR
        previous = lx_db_error.
        
  ENDTRY.

ENDFUNCTION.
```

**Custom Exception Class**:
```abap
CLASS ZCX_INVOICE_ERROR DEFINITION
  PUBLIC
  INHERITING FROM CX_STATIC_CHECK
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    CONSTANTS:
      BEGIN OF INVOICE_NOT_FOUND,
        msgid TYPE symsgid VALUE 'ZCUSTPRTL',
        msgno TYPE symsgno VALUE '001',
        attr1 TYPE scx_attrname VALUE 'INVOICE_ID',
        attr2 TYPE scx_attrname VALUE '',
        attr3 TYPE scx_attrname VALUE '',
        attr4 TYPE scx_attrname VALUE '',
      END OF INVOICE_NOT_FOUND,
      
      BEGIN OF DATABASE_ERROR,
        msgid TYPE symsgid VALUE 'ZCUSTPRTL',
        msgno TYPE symsgno VALUE '002',
        attr1 TYPE scx_attrname VALUE '',
        attr2 TYPE scx_attrname VALUE '',
        attr3 TYPE scx_attrname VALUE '',
        attr4 TYPE scx_attrname VALUE '',
      END OF DATABASE_ERROR.

    DATA invoice_id TYPE C(10) READ-ONLY.

    METHODS constructor
      IMPORTING
        textid LIKE if_t100_message=>t100key OPTIONAL
        previous LIKE previous OPTIONAL
        invoice_id TYPE C(10) OPTIONAL.

ENDCLASS.

CLASS ZCX_INVOICE_ERROR IMPLEMENTATION.
  METHOD constructor ##ADT_SUPPRESS_GENERATION.
    CALL METHOD super->constructor
      EXPORTING
        previous = previous.
    
    me->invoice_id = invoice_id.
    
    CLEAR me->textid.
    IF textid IS INITIAL.
      if_t100_message~t100key = if_t100_message=>default_textid.
    ELSE.
      if_t100_message~t100key = textid.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```


## Testing Strategy

### Testing Approach

This is a practice project, so testing focuses on core functionality without comprehensive coverage.

#### Unit Testing (Angular)

**Test Framework**: Jasmine + Karma

**Services to Test**:
- AuthService (login, token management)
- InvoiceService (API calls)
- PaymentService (payment processing)

**Example Unit Test**:
```typescript
// invoice.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvoiceService]
    });

    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch invoice list', () => {
    const mockInvoices = {
      success: true,
      invoices: [
        { invoiceNumber: '001', amount: 1000 },
        { invoiceNumber: '002', amount: 2000 }
      ],
      totalCount: 2
    };

    service.getInvoiceList(0, 50).subscribe(response => {
      expect(response.invoices.length).toBe(2);
      expect(response.totalCount).toBe(2);
    });

    const req = httpMock.expectOne('https://localhost:3443/api/invoice/list?skip=0&top=50');
    expect(req.request.method).toBe('GET');
    req.flush(mockInvoices);
  });

  it('should handle error when fetching invoices', () => {
    service.getInvoiceList(0, 50).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('https://localhost:3443/api/invoice/list?skip=0&top=50');
    req.flush({ error: 'Failed to load invoices' }, { status: 500, statusText: 'Server Error' });
  });
});
```

#### Integration Testing (Middleware)

**Test Framework**: Jest or Mocha

**Tests to Implement**:
- RFC connection pool initialization
- JWT token generation and validation
- API endpoint responses
- Error handling

**Example Integration Test**:
```javascript
// auth.routes.test.js

const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/login', () => {
  it('should return JWT token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpass'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.role).toBeDefined();
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'invalid',
        password: 'wrong'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid credentials');
  });
});
```

#### Manual Testing

**Test Scenarios**:
1. **Login Flow**: Valid/invalid credentials, token expiry
2. **Dashboard**: KPI cards load, recent invoices display
3. **Invoice List**: Pagination works, search filters correctly
4. **Invoice Form**: PDF generates and opens in new tab
5. **Payment**: Amount validation, balance checking, success/error messages
6. **Profile**: View profile, update email/phone
7. **Delivery**: List displays, details show line items
8. **Inquiry**: Form submission, sales order tracking

**Testing Checklist**:
- [ ] Login with valid credentials → Dashboard loads
- [ ] Login with invalid credentials → Error message displays
- [ ] Dashboard KPI cards show correct totals
- [ ] Invoice list loads 50 records
- [ ] Pagination Next button loads next 50 records
- [ ] Search filters invoices by number
- [ ] Click invoice card → PDF opens in new tab
- [ ] Payment form validates amount > 0
- [ ] Payment form prevents amount > balance
- [ ] Profile displays customer information
- [ ] Profile update saves email and phone
- [ ] Delivery list shows tracking numbers
- [ ] Inquiry form submits successfully
- [ ] Sales order list displays orders
- [ ] Logout clears token and redirects to login


## Security Design

### Authentication Flow

```
1. User enters username/password in LoginComponent
   ↓
2. Angular sends POST /api/auth/login to middleware
   ↓
3. Middleware calls Z_RFC_VALIDATE_USER(username, password)
   ↓
4. SAP validates credentials and returns EV_VALID='X', EV_ROLE='Admin'
   ↓
5. Middleware generates JWT token with payload:
   {
     username: 'john.doe',
     role: 'Admin',
     exp: timestamp + 8 hours
   }
   ↓
6. Middleware returns token to Angular
   ↓
7. Angular stores token in localStorage
   ↓
8. Angular includes token in Authorization header for all API calls:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ↓
9. Middleware validates token on each request
   ↓
10. If valid, request proceeds; if invalid/expired, return 401
```

### JWT Token Structure

```javascript
// Token Payload
{
  "username": "john.doe",
  "role": "Admin",
  "customerId": "1000",
  "iat": 1684512000,  // Issued at timestamp
  "exp": 1684540800   // Expiry timestamp (8 hours later)
}

// Token Generation
const jwt = require('jsonwebtoken');

function generateToken(username, role, customerId) {
  return jwt.sign(
    { username, role, customerId },
    process.env.JWT_SECRET || 'SECRET_KEY',
    { expiresIn: '8h' }
  );
}

// Token Validation
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

### Role-Based Access Control (RBAC)

**Roles**:
- **Admin**: Full access to all features including credit/debit note requests
- **User**: Read-only access to invoices, payments, deliveries; can submit inquiries

**RBAC Middleware**:
```javascript
// middleware/rbac.middleware.js

function requireRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
}

// Usage in routes
router.post('/api/creditdebit/request', 
  authMiddleware,
  requireRole(['Admin']),
  creditDebitController.requestCreditDebit
);
```

### HTTPS/TLS Configuration

**Self-Signed Certificate for Local Testing**:
```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr

# Generate self-signed certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
```

**Express HTTPS Server**:
```javascript
// server.js

const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

const httpsOptions = {
  key: fs.readFileSync('./config/server.key'),
  cert: fs.readFileSync('./config/server.cert')
};

const server = https.createServer(httpsOptions, app);

server.listen(3443, () => {
  console.log('HTTPS server running on port 3443');
});
```

### Security Best Practices

**What We Implement**:
1. ✅ HTTPS/TLS encryption for all communication
2. ✅ JWT token authentication with 8-hour expiry
3. ✅ Role-based access control (Admin/User)
4. ✅ No logging of passwords or tokens
5. ✅ Input validation on frontend and backend
6. ✅ SQL injection prevention (parameterized queries in ABAP)

**What We Skip (Practice Project)**:
1. ❌ Multi-factor authentication (MFA)
2. ❌ Rate limiting
3. ❌ CAPTCHA
4. ❌ SNC encryption for RFC
5. ❌ Field masking in logs
6. ❌ Account lockout after failed attempts
7. ❌ Password complexity requirements
8. ❌ Session management (stateless JWT only)


## Performance Considerations

### RFC Connection Pooling

**Pool Configuration**:
```javascript
// services/rfc-pool.service.js

const Pool = require('node-rfc').Pool;

const rfcConfig = {
  connectionParameters: {
    host: process.env.SAP_HOST || '192.168.1.100',
    port: 3200,  // SAP gateway port
    user: process.env.SAP_USER || 'TESTUSER',
    passwd: process.env.SAP_PASSWORD || 'password123',
    client: '100',
    lang: 'EN'
  },
  connectionOptions: {
    timeout: 30  // 30 seconds timeout
  }
};

const rfcPool = new Pool(rfcConfig);

// Open 5 connections
rfcPool.open(5);

module.exports = rfcPool;
```

**Connection Pool Benefits**:
- Reuses connections instead of creating new ones for each request
- Reduces connection overhead (handshake, authentication)
- Handles up to 10 concurrent requests by queuing when pool is exhausted
- Automatically reconnects on connection failure

### Pagination Strategy

**Backend Pagination (ABAP)**:
```abap
" Efficient pagination using OFFSET and LENGTH
SELECT * FROM ZINVOICES
  INTO TABLE lt_all_invoices
  WHERE customer_id = IV_CUSTOMER_ID
  ORDER BY invoice_date DESC
  OFFSET IV_SKIP
  LENGTH IV_TOP.
```

**Frontend Pagination**:
- Load 50 records per page (configurable)
- Display Previous/Next buttons only when needed
- Show current page and total count
- Cache loaded pages to avoid redundant API calls (optional)

### Lazy Loading Modules

**Route Configuration**:
```typescript
// app-routing.module.ts

const routes: Routes = [
  { path: 'login', component: LoginComponent },  // Eager loaded
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },  // Eager loaded
  
  // Lazy loaded modules
  {
    path: 'invoice',
    loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'payment',
    loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'delivery',
    loadChildren: () => import('./delivery/delivery.module').then(m => m.DeliveryModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'inquiry',
    loadChildren: () => import('./inquiry/inquiry.module').then(m => m.InquiryModule),
    canActivate: [AuthGuard]
  },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
```

**Benefits**:
- Initial bundle size reduced by ~60%
- Faster initial page load (< 2 seconds)
- Modules loaded on-demand when user navigates
- Better user experience

### Caching Strategy

**Frontend Caching (Optional)**:
```typescript
// invoice.service.ts

export class InvoiceService {
  private invoiceCache = new Map<string, Invoice>();
  
  getInvoiceDetails(invoiceId: string): Observable<Invoice> {
    // Check cache first
    if (this.invoiceCache.has(invoiceId)) {
      return of(this.invoiceCache.get(invoiceId));
    }
    
    // Fetch from API
    return this.apiService.get<Invoice>(`/api/invoice/${invoiceId}`)
      .pipe(
        tap(invoice => {
          // Store in cache
          this.invoiceCache.set(invoiceId, invoice);
        })
      );
  }
}
```

### Performance Targets

**Response Time Goals**:
- Dashboard load: < 3 seconds
- Invoice list (50 records): < 2 seconds
- Invoice detail: < 1 second
- PDF generation: < 5 seconds
- Payment processing: < 3 seconds

**Concurrent Request Handling**:
- Support 10 concurrent API requests
- RFC pool handles queuing when all 5 connections are busy
- No request timeout under 30 seconds


## Smart Forms Design

### Smart Form Architecture

**Smart Form Template (ZSF_INVOICE)**:
- Created in transaction SMARTFORMS
- Contains invoice header, line items table, totals section
- Uses SAP standard form elements (windows, tables, text elements)
- Outputs PDF format

### Smart Form Generation Flow

```
1. User clicks "View Form" button on invoice
   ↓
2. Angular calls GET /api/invoice/:id/form
   ↓
3. Middleware calls Z_INVOICE_CREATE_FORM(IV_INVOICE_ID)
   ↓
4. ABAP function module:
   a. Fetches invoice data from ZINVOICES and ZINVOICE_ITEMS
   b. Calls SSF_FUNCTION_MODULE_NAME to get generated FM name
   c. Calls generated FM with invoice data (WA_INVOICE parameter)
   d. Converts output to PDF blob
   ↓
5. Middleware returns PDF blob with Content-Type: application/pdf
   ↓
6. Angular creates blob URL and opens in new tab
```

### ABAP Smart Form Implementation

```abap
FUNCTION Z_INVOICE_CREATE_FORM.
*"----------------------------------------------------------------------
*" IMPORTING
*"   IV_INVOICE_ID TYPE C(10)
*" EXPORTING
*"   EV_PDF_BLOB TYPE XSTRING
*" RAISING
*"   ZCX_INVOICE_ERROR
*"----------------------------------------------------------------------

  DATA: lv_form_name TYPE TDSFNAME VALUE 'ZSF_INVOICE',
        lv_fm_name TYPE FUNCNAME,
        ls_invoice TYPE ZINVOICE_S,
        lt_line_items TYPE TABLE OF ZINVOICE_ITEM_S,
        ls_output_options TYPE SSFCOMPOP,
        ls_control_params TYPE SSFCTRLOP,
        ls_job_output_info TYPE SSFCRESCL,
        lv_pdf_size TYPE I.

  TRY.
    " Fetch invoice data
    SELECT SINGLE * FROM ZINVOICES
      INTO ls_invoice
      WHERE invoice_number = IV_INVOICE_ID.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
        EXPORTING
          textid = ZCX_INVOICE_ERROR=>INVOICE_NOT_FOUND
          invoice_id = IV_INVOICE_ID.
    ENDIF.

    " Fetch line items
    SELECT * FROM ZINVOICE_ITEMS
      INTO TABLE lt_line_items
      WHERE invoice_number = IV_INVOICE_ID
      ORDER BY item_number.

    " Get Smart Form function module name
    CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'
      EXPORTING
        formname           = lv_form_name
      IMPORTING
        fm_name            = lv_fm_name
      EXCEPTIONS
        no_form            = 1
        no_function_module = 2
        OTHERS             = 3.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
        EXPORTING
          textid = ZCX_INVOICE_ERROR=>SMARTFORM_NOT_FOUND.
    ENDIF.

    " Set output options for PDF
    ls_output_options-tdprinter = 'PDF1'.
    ls_output_options-tdnoprev = 'X'.
    ls_control_params-no_dialog = 'X'.
    ls_control_params-getotf = 'X'.

    " Call Smart Form
    CALL FUNCTION lv_fm_name
      EXPORTING
        control_parameters = ls_control_params
        output_options     = ls_output_options
        wa_invoice         = ls_invoice
        it_line_items      = lt_line_items
      IMPORTING
        job_output_info    = ls_job_output_info
      EXCEPTIONS
        formatting_error   = 1
        internal_error     = 2
        send_error         = 3
        user_canceled      = 4
        OTHERS             = 5.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
        EXPORTING
          textid = ZCX_INVOICE_ERROR=>FORM_GENERATION_ERROR.
    ENDIF.

    " Convert OTF to PDF
    CALL FUNCTION 'CONVERT_OTF_TO_PDF'
      EXPORTING
        format                = 'PDF'
      IMPORTING
        bin_filesize          = lv_pdf_size
        bin_file              = EV_PDF_BLOB
      TABLES
        otf                   = ls_job_output_info-otfdata
      EXCEPTIONS
        err_max_linewidth     = 1
        err_format            = 2
        err_conv_not_possible = 3
        OTHERS                = 4.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
        EXPORTING
          textid = ZCX_INVOICE_ERROR=>PDF_CONVERSION_ERROR.
    ENDIF.

  CATCH ZCX_INVOICE_ERROR INTO DATA(lx_error).
    RAISE EXCEPTION lx_error.

  CATCH CX_SY_OPEN_SQL_DB_ERROR INTO DATA(lx_db_error).
    RAISE EXCEPTION TYPE ZCX_INVOICE_ERROR
      EXPORTING
        textid = ZCX_INVOICE_ERROR=>DATABASE_ERROR
        previous = lx_db_error.

  ENDTRY.

ENDFUNCTION.
```

### Smart Form Template Structure

**ZSF_INVOICE Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                    INVOICE                               │
│                                                          │
│  Company Logo                    Invoice #: 90000010    │
│  KaarTech                        Date: 05/18/2025       │
│  123 Business St                 Due Date: 06/18/2025   │
│  New York, NY 10001                                     │
│                                                          │
│  Bill To:                                               │
│  STACY'S                                                │
│  456 Customer Ave                                       │
│  Los Angeles, CA 90001                                  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Item  Product    Description    Qty   Unit Price  Total│
├─────────────────────────────────────────────────────────┤
│   1    PROD001    Product A      10    $100.00   $1,000 │
│   2    PROD002    Product B      5     $200.00   $1,000 │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                   Subtotal:    $2,000.00│
│                                   Tax (10%):     $200.00│
│                                   Total:       $2,200.00│
└─────────────────────────────────────────────────────────┘
```

### Middleware PDF Handling

```javascript
// routes/invoice.routes.js

router.get('/invoice/:id/form', authMiddleware, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    
    // Call RFC function
    const result = await rfcCallService.callRfcFunction('Z_INVOICE_CREATE_FORM', {
      IV_INVOICE_ID: invoiceId
    });
    
    // Get PDF blob from result
    const pdfBlob = result.EV_PDF_BLOB;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice_${invoiceId}.pdf"`);
    
    // Send PDF
    res.send(Buffer.from(pdfBlob, 'hex'));
    
  } catch (error) {
    console.error('Failed to generate invoice form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate form. Smart Form template may not exist.'
    });
  }
});
```


## Deployment Architecture

### Local Development Setup

**Prerequisites**:
- Node.js 16+ and npm
- Angular CLI 15+
- SAP NetWeaver RFC SDK
- Access to SAP ERP system (on-premise)

**Environment Configuration**:
```
# .env file for middleware

SAP_HOST=192.168.1.100
SAP_PORT=3200
SAP_USER=TESTUSER
SAP_PASSWORD=password123
SAP_CLIENT=100
SAP_LANG=EN

JWT_SECRET=your_secret_key_here
JWT_EXPIRY=8h

HTTPS_PORT=3443
HTTPS_KEY_PATH=./config/server.key
HTTPS_CERT_PATH=./config/server.cert
```

### Development Workflow

```
1. Start SAP system (on-premise)
   ↓
2. Start Node.js middleware:
   cd middleware
   npm install
   npm start
   → Server running on https://localhost:3443
   ↓
3. Start Angular development server:
   cd frontend
   npm install
   ng serve
   → App running on http://localhost:4200
   ↓
4. Access portal at http://localhost:4200
   → Angular proxies API calls to https://localhost:3443
```

### Angular Proxy Configuration

```json
// proxy.conf.json

{
  "/api": {
    "target": "https://localhost:3443",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

```json
// angular.json (serve configuration)

{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

### Production Deployment (Future)

**For Production Deployment** (not implemented in practice project):

1. **Frontend**:
   - Build Angular app: `ng build --prod`
   - Deploy to web server (Nginx, Apache)
   - Configure HTTPS with valid SSL certificate

2. **Middleware**:
   - Deploy Node.js app to server
   - Use PM2 or similar for process management
   - Configure environment variables
   - Set up logging and monitoring

3. **SAP Connection**:
   - Use SAP Cloud Connector if deploying to cloud
   - Configure firewall rules for RFC port 3200
   - Implement SNC encryption for RFC

4. **Security Enhancements**:
   - Replace self-signed certificate with CA-signed certificate
   - Implement rate limiting
   - Add MFA authentication
   - Set up WAF (Web Application Firewall)

### System Requirements

**Frontend (Angular)**:
- Browser: Chrome 90+, Firefox 88+, Edge 90+
- Screen resolution: 1024x768 minimum
- JavaScript enabled

**Middleware (Node.js)**:
- Node.js 16+ LTS
- 2 GB RAM minimum
- 10 GB disk space

**Backend (SAP)**:
- SAP ERP 6.0 or higher
- ABAP 7.4 or higher
- RFC-enabled function modules
- Smart Forms capability


## Design Decisions and Rationale

### Why Generic ABAP Data Types?

**Decision**: Use generic types (C, N, P, D) instead of SAP Data Dictionary types (BELNR, KUNNR, DMBTR)

**Rationale**:
- Simpler for practice/learning project
- No dependency on SAP Data Dictionary maintenance
- Easier to understand for beginners
- Sufficient for functional requirements
- Can be migrated to Dictionary types later if needed

**Trade-off**: Lose built-in validation and semantic meaning, but gain simplicity

### Why 5 RFC Connections?

**Decision**: Maintain pool of 5 RFC connections

**Rationale**:
- Sufficient for practice project with limited concurrent users
- Balances performance and resource usage
- SAP system can handle 5 connections without strain
- Allows testing of connection pooling concept
- Can be increased to 10-20 for production

**Trade-off**: May queue requests under heavy load, but acceptable for practice

### Why JWT Instead of Session-Based Auth?

**Decision**: Use stateless JWT tokens with 8-hour expiry

**Rationale**:
- Stateless authentication (no server-side session storage)
- Scales better (no session synchronization needed)
- Works well with REST API architecture
- Simpler to implement than session management
- Industry standard for modern web applications

**Trade-off**: Cannot revoke tokens before expiry, but acceptable for practice

### Why Lazy Loading for Feature Modules?

**Decision**: Lazy load Invoice, Payment, Delivery, Profile, Inquiry modules

**Rationale**:
- Reduces initial bundle size by ~60%
- Faster initial page load (< 2 seconds)
- Better user experience
- Teaches best practice for Angular applications
- Easy to implement with Angular CLI

**Trade-off**: Slight delay when first navigating to lazy-loaded module, but negligible

### Why Material Design?

**Decision**: Use Angular Material for UI components

**Rationale**:
- Professional, consistent look and feel
- Pre-built components (tables, cards, forms, spinners)
- Responsive design out of the box
- Well-documented and maintained
- Reduces custom CSS development time

**Trade-off**: Larger bundle size, but acceptable for practice

### Why Skip NgRx State Management?

**Decision**: Use simple RxJS Observables and services instead of NgRx

**Rationale**:
- NgRx adds significant complexity
- Overkill for practice project with simple state
- Easier to learn and understand
- Faster development
- Can be added later if needed

**Trade-off**: Less structured state management, but acceptable for practice

### Why Smart Forms Instead of Adobe Forms?

**Decision**: Use SAP Smart Forms for PDF generation

**Rationale**:
- Simpler to learn and implement
- No additional licensing required
- Sufficient for basic invoice PDFs
- Faster setup (30 minutes vs 2+ hours)
- Good for practice/learning

**Trade-off**: Less advanced features (no digital signatures), but acceptable for practice

### Why On-Premise Instead of SAP BTP?

**Decision**: Deploy to on-premise SAP system

**Rationale**:
- Simpler setup (no Cloud Connector needed)
- Lower cost (no BTP subscription)
- Faster to get started
- Direct RFC connection
- Good for practice/learning

**Trade-off**: Not cloud-ready, but can migrate later

### Why Skip MFA and Advanced Security?

**Decision**: Implement only basic security (HTTPS, JWT, RBAC)

**Rationale**:
- Focus on core functionality first
- MFA adds 4+ hours of development time
- Sufficient for practice/learning environment
- Can be added later for production
- Teaches fundamental security concepts

**Trade-off**: Less secure, but acceptable for practice (not production)


## Future Enhancements

### Phase 2 Enhancements (After Practice Project)

**1. Real-Time Notifications**
- Implement WebSocket connection for real-time updates
- Notify users when invoice status changes
- Alert on payment confirmation
- Show delivery status updates

**2. Advanced Search and Filtering**
- Add date range filters for invoices
- Filter by status, amount range
- Sort by multiple columns
- Export search results to CSV

**3. Mobile Responsive Design**
- Optimize layout for mobile devices
- Touch-friendly UI elements
- Progressive Web App (PWA) capabilities
- Offline access to cached data

**4. Credit/Debit Note Workflow**
- Allow customers to request credit/debit notes
- Approval workflow for Admin users
- Email notifications on status changes
- Attach supporting documents

**5. Payment Gateway Integration**
- Integrate with Stripe or PayPal
- Support credit card payments
- Automated payment confirmation
- Payment receipt generation

**6. Analytics Dashboard**
- Visualize payment trends with charts
- Aging analysis with graphs
- Spending patterns over time
- Export reports to PDF/Excel

**7. Multi-Language Support**
- Internationalization (i18n)
- Support for English, Spanish, German
- Language switcher in navbar
- Localized date and currency formats

**8. Document Management**
- Upload and attach documents to invoices
- Store in SAP ArchiveLink
- View document history
- Download multiple documents as ZIP

### Phase 3 Enhancements (Production-Ready)

**1. Advanced Security**
- Multi-factor authentication (MFA)
- Rate limiting and CAPTCHA
- SNC encryption for RFC
- Penetration testing and security audit

**2. Performance Optimization**
- Redis caching for frequently accessed data
- CDN for static assets
- Database query optimization
- Load balancing for middleware

**3. Monitoring and Logging**
- Application Performance Monitoring (APM)
- Centralized logging (ELK stack)
- Error tracking (Sentry)
- User analytics (Google Analytics)

**4. DevOps and CI/CD**
- Automated testing pipeline
- Continuous integration with Jenkins/GitLab CI
- Automated deployment to staging/production
- Blue-green deployment strategy

**5. Migration to OData**
- Replace RFC with OData services
- Use SAP Gateway or RAP (RESTful ABAP Programming)
- JSON format instead of binary RFC
- Better performance and scalability

**6. Cloud Deployment**
- Deploy to SAP BTP (Business Technology Platform)
- Use SAP Cloud Connector for on-premise integration
- Leverage cloud services (authentication, storage)
- Auto-scaling and high availability

### Known Limitations (Current Design)

**1. Single Tenant**
- No multi-tenant support
- One customer per login session
- Cannot switch between customers

**2. No Real-Time Sync**
- Data fetched on-demand only
- No automatic refresh when data changes in SAP
- User must manually refresh

**3. Limited Offline Support**
- Requires internet connection
- No offline data access
- No service worker caching

**4. Basic Pagination**
- Simple skip/top pagination only
- No cursor-based pagination
- No infinite scroll

**5. Static Smart Forms**
- Fixed template layout
- No dynamic field rendering
- Cannot customize per customer

**6. No Audit Trail**
- No tracking of user actions
- No change history
- No compliance reporting

**7. Limited Error Recovery**
- No automatic retry on transient failures
- No circuit breaker pattern
- Manual retry only

**8. No Bulk Operations**
- Cannot process multiple invoices at once
- No batch payment processing
- No bulk export

These limitations are acceptable for a practice/learning project but should be addressed for production deployment.

