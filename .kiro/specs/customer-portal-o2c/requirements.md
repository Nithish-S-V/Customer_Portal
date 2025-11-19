# Requirements Document

## Introduction

This document defines the requirements for a **practice/learning Customer Portal** that manages the Order-to-Cash (O2C) cycle for KaarTech. This is a pragmatic implementation focused on core MUST-HAVE features, not enterprise-scale complexity. The portal enables customers to access their financial information, view invoices, process payments, track deliveries, and manage inquiries through a web-based interface. The system uses Angular frontend, Node.js RFC middleware, and SAP ABAP backend with on-premise deployment.

## Glossary

- **Customer Portal System**: The complete web application consisting of Angular frontend, Node.js Express middleware, and SAP ERP ABAP backend
- **RFC Middleware**: Node.js Express server running on port 3443 with HTTPS that manages RFC connection pool (5 connections) and acts as API gateway
- **Finance Sheet**: Dashboard view displaying invoice cards with tabs for Invoice, Credit/Debit, Aging, and Overall Sales
- **Smart Form**: SAP form template created in transaction SMARTFORMS (ZSF_INVOICE) used to generate PDF documents on-demand
- **O2C Cycle**: Order-to-Cash business process from inquiry and sales order creation to invoice generation, payment processing, and delivery
- **JWT Token**: JSON Web Token with 8-hour expiry used for stateless authentication and role-based authorization
- **ABAP Function Module**: Remote-enabled function in SAP following naming convention Z_MODULE_ACTION_ENTITY that can be called via RFC protocol using generic data types (C for character, N for numeric, P for packed decimal)
- **Connection Pool**: Set of 5 pre-established RFC connections maintained by node-rfc library for reuse to improve performance
- **SY-SUBRC**: System return code in ABAP indicating success (0), not found (4), or error (8) after database operations
- **BAPI**: Business API in SAP that modifies data and requires BAPI_TRANSACTION_COMMIT to persist changes to database

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a customer, I want to securely log into the portal using my username and password, so that I can access my financial information and transaction history.

#### Acceptance Criteria

1. WHEN a customer submits login form with username and password, THE Customer Portal System SHALL call SAP ABAP function module Z_RFC_VALIDATE_USER with parameters IV_USERNAME and IV_PASSWORD
2. WHEN Z_RFC_VALIDATE_USER returns EV_VALID equals 'X' and SY-SUBRC equals 0, THE RFC Middleware SHALL generate JWT token with 8-hour expiry using SECRET_KEY
3. THE RFC Middleware SHALL include username and role (Admin or User) from EV_ROLE parameter in JWT token payload
4. WHEN a customer attempts to access protected API endpoints without Authorization header containing Bearer token, THE RFC Middleware SHALL return HTTP 401 Unauthorized response
5. WHEN a customer clicks logout button, THE Customer Portal System SHALL clear JWT token from localStorage and redirect to login page
6. WHEN customer is redirected to login after logout, THE JWT token in localStorage SHALL be removed, and subsequent API calls without token SHALL receive HTTP 401 response

### Requirement 2: Finance Sheet Dashboard with KPI Cards

**User Story:** As a customer, I want to view a dashboard with my financial summary and recent invoices displayed as cards, so that I can quickly understand my account status.

#### Acceptance Criteria

1. WHEN a customer navigates to dashboard after login, THE Customer Portal System SHALL display four Material Design KPI cards showing Total Invoices count, Total Amount in currency format, Paid Amount, and Pending Amount
2. THE RFC Middleware SHALL call SAP ABAP function module Z_INVOICE_GET_STATS with parameter IV_CUSTOMER_ID and receive exporting parameters EV_TOTAL_COUNT, EV_TOTAL_AMOUNT, EV_PAID_AMOUNT, and EV_PENDING_AMOUNT
3. THE Customer Portal System SHALL display recent invoices (maximum 5) as clickable Material Design cards showing invoice number, date formatted as MM/DD/YYYY, amount with currency pipe, and status
4. WHEN a customer clicks on an invoice card, THE Customer Portal System SHALL call Z_INVOICE_CREATE_FORM function module and open generated PDF in new browser tab
5. THE Customer Portal System SHALL display tabs for Invoice, Credit/Debit, Aging, and Overall Sales on Finance Sheet with Invoice tab active by default

### Requirement 3: Invoice List with Pagination and Search

**User Story:** As a customer, I want to view a paginated list of all my invoices with search capability, so that I can find specific invoices efficiently.

#### Acceptance Criteria

1. THE Customer Portal System SHALL display invoices in Material Design table (mat-table) with columns for Invoice Number, Amount, Date, Due Date, and Status with View Form button
2. THE RFC Middleware SHALL call SAP ABAP function module Z_INVOICE_GET_LIST with parameters IV_CUSTOMER_ID, IV_SKIP with default value 0, and IV_TOP with default value 50 records per page
3. WHEN Z_INVOICE_GET_LIST returns ET_INVOICES table and EV_TOTAL_COUNT, THE Customer Portal System SHALL display invoice records and pagination controls with Previous and Next buttons
4. THE Customer Portal System SHALL display pagination controls with Previous and Next buttons when total invoices exceed 50
5. THE Customer Portal System SHALL load next 50 records when customer clicks Next button by incrementing IV_SKIP by 50
6. WHEN a customer enters text in search box, THE Customer Portal System SHALL filter displayed invoices by invoice number matching search text
7. WHEN Z_INVOICE_GET_LIST returns SY-SUBRC not equal to 0, THE Customer Portal System SHALL display error message "Failed to load invoices. Please try again later." without exposing ABAP error details
8. THE Customer Portal System SHALL load invoice list in less than 2 seconds for 50 records under normal network conditions

### Requirement 4: Invoice Detail and Smart Form PDF Generation

**User Story:** As a customer, I want to view detailed invoice information and generate a PDF form, so that I can review line items and save the invoice for my records.

#### Acceptance Criteria

1. WHEN a customer clicks on invoice from list, THE RFC Middleware SHALL call SAP ABAP function module Z_INVOICE_GET_DETAILS with parameter IV_INVOICE_ID of type C length 10
2. WHEN Z_INVOICE_GET_DETAILS returns SY-SUBRC equals 0, THE Customer Portal System SHALL display invoice header with customer name, invoice date, due date, and exporting parameter EV_TOTAL_AMOUNT
3. THE Customer Portal System SHALL display line items from internal table ET_LINE_ITEMS showing item number, product code, description, quantity, unit price, and total price
4. WHEN a customer clicks "View Form" button, THE RFC Middleware SHALL call Z_INVOICE_CREATE_FORM which internally calls SSF_FUNCTION_MODULE_NAME to get Smart Form function module name for ZSF_INVOICE template created in transaction SMARTFORMS
5. THE RFC Middleware SHALL pass invoice data to Smart Form via WA_INVOICE parameter structure and generate PDF output as blob
6. WHEN Z_INVOICE_CREATE_FORM calls SSF_FUNCTION_MODULE_NAME and SY-SUBRC not equal 0, THE RFC Middleware SHALL return HTTP 500 with message "Failed to generate form. Smart Form template may not exist."
7. THE RFC Middleware SHALL return PDF as blob with Content-Type application/pdf and THE Customer Portal System SHALL open PDF in new browser tab using window.open with blob URL

### Requirement 5: Payment History and Processing

**User Story:** As a customer, I want to view my payment history and process new payments, so that I can manage my account balance and settle invoices.

#### Acceptance Criteria

1. THE RFC Middleware SHALL call SAP ABAP function module Z_PAYMENT_GET_LIST with parameter IV_CUSTOMER_ID of type C length 10 and receive internal table ET_PAYMENTS
2. THE Customer Portal System SHALL display payment history table showing payment number, invoice reference, amount of type P length 15 decimals 2, payment date, and payment method
3. WHEN a customer initiates payment, THE Customer Portal System SHALL validate that payment amount is greater than 0 before calling backend
4. WHEN customer attempts to pay more than invoice balance, THE RFC Middleware SHALL call Z_INVOICE_GET_DETAILS to verify balance, and IF payment amount exceeds balance, return HTTP 400 with message "Payment amount exceeds invoice balance"
5. THE RFC Middleware SHALL validate currency matches invoice currency before processing payment
6. THE RFC Middleware SHALL call BAPI_PAYMENT_CREATE and WHEN SY-SUBRC equals 0, SHALL call BAPI_TRANSACTION_COMMIT with parameter WAIT equals 'X'
7. WHEN BAPI_TRANSACTION_COMMIT returns SY-SUBRC not equal to 0, THE RFC Middleware SHALL call BAPI_TRANSACTION_ROLLBACK and return HTTP 500 error with message "Payment processing failed. Please try again."
8. WHEN BAPI_PAYMENT_CREATE succeeds and customer clicks refresh, THE Customer Portal System SHALL fetch latest payment list to show new payment without double-posting

### Requirement 6: Credit and Debit Note Management

**User Story:** As a customer, I want to view credit and debit notes related to my invoices, so that I can understand adjustments to my account.

#### Acceptance Criteria

1. THE Customer Portal System SHALL display Credit/Debit tab on Finance Sheet with toggle to switch between credit notes and debit notes
2. THE RFC Middleware SHALL call SAP ABAP function module Z_CREDITDEBIT_GET_LIST with parameters IV_CUSTOMER_ID and IV_DOC_TYPE with values 'CREDIT' or 'DEBIT'
3. THE Customer Portal System SHALL display table showing document number, reference invoice number, amount, reason code, and creation date formatted as MM/DD/YYYY
4. WHEN a customer clicks on credit or debit note row, THE Customer Portal System SHALL call Z_CREDITDEBIT_GET_DETAILS with IV_DOCUMENT_ID and display line items with product details
5. WHEN customer has Admin role in JWT token, THE Customer Portal System SHALL display "Request Credit/Debit" button that opens inquiry form

### Requirement 7: Delivery Tracking and Management

**User Story:** As a customer, I want to track the status of my deliveries, so that I can plan for receipt of goods and services.

#### Acceptance Criteria

1. THE RFC Middleware SHALL call SAP ABAP function module Z_DELIVERY_GET_LIST with parameter IV_CUSTOMER_ID and receive internal table ET_DELIVERIES
2. THE Customer Portal System SHALL display delivery list showing delivery number, sales order reference, delivery date, status (Planned, In Transit, Delivered), and tracking number
3. WHEN a customer clicks on delivery row, THE RFC Middleware SHALL call Z_DELIVERY_GET_DETAILS with IV_DELIVERY_ID and THE Customer Portal System SHALL display line items with product code, description, quantity, and shipping information
4. WHEN a customer clicks refresh button, THE Customer Portal System SHALL re-fetch delivery list from SAP to show updated status
5. WHEN a customer clicks "Download Document" button, THE RFC Middleware SHALL call Z_DELIVERY_CREATE_FORM to generate PDF and return as blob for download

### Requirement 8: Customer Profile View and Update

**User Story:** As a customer, I want to view and update my profile information, so that I can keep my contact details current.

#### Acceptance Criteria

1. THE RFC Middleware SHALL call SAP ABAP function module Z_CUSTOMER_GET_PROFILE with parameter IV_CUSTOMER_ID of type C length 10 and receive exporting structure ES_CUSTOMER
2. THE Customer Portal System SHALL display customer name, street address, city, postal code, country, email, phone number, payment terms, and credit limit in read-only format
3. WHEN a customer clicks "Edit Profile" button, THE Customer Portal System SHALL enable editing for email and phone number fields only and validate email format and phone number length before submission
4. THE RFC Middleware SHALL call Z_CUSTOMER_UPDATE_PROFILE with IV_CUSTOMER_ID and changing structure CS_CUSTOMER and check SY-SUBRC equals 0 for success
5. WHEN profile update succeeds, THE Customer Portal System SHALL display success message "Profile updated successfully" and refresh profile data

### Requirement 9: Inquiry Submission and Sales Order Tracking

**User Story:** As a customer, I want to submit inquiries about products and services and track my sales orders, so that I can manage my purchasing process.

#### Acceptance Criteria

1. THE Customer Portal System SHALL provide inquiry form with required fields for product code, quantity as positive integer, requested delivery date, and description with maximum 500 characters
2. WHEN a customer submits inquiry, THE RFC Middleware SHALL call SAP ABAP function module Z_INQUIRY_CREATE with parameters IV_CUSTOMER_ID, IV_PRODUCT_CODE, IV_QUANTITY, IV_DELIVERY_DATE, and IV_DESCRIPTION
3. THE Customer Portal System SHALL treat inquiry and sales order as separate processes where inquiry is a request for quotation and sales order is created separately by supplier after receiving purchase order from buyer
4. THE RFC Middleware SHALL call Z_SALESORDER_GET_LIST with parameter IV_CUSTOMER_ID and receive internal table ET_SALES_ORDERS for display
5. THE Customer Portal System SHALL display sales orders table showing order number, order date, requested delivery date, total amount, and status (Open, In Process, Completed, Cancelled)
6. WHEN a customer clicks on sales order row, THE RFC Middleware SHALL call Z_SALESORDER_GET_DETAILS with IV_ORDER_ID and THE Customer Portal System SHALL display header information and line items with product details

### Requirement 10: RFC Connection Pool Management

**User Story:** As a system administrator, I want the middleware to efficiently manage RFC connections to SAP, so that the portal performs reliably under load.

#### Acceptance Criteria

1. THE RFC Middleware SHALL initialize node-rfc Pool with connectionParameters containing SAP host IP address, SAP gateway port 3200, SAP user, SAP password, SAP client 100, and language 'EN' and open 5 concurrent connections
2. WHEN an API endpoint receives request, THE RFC Middleware SHALL acquire connection from pool using await pool.acquire(), call RFC function module, and release connection using pool.release() in finally block
3. THE RFC Middleware SHALL check SY-SUBRC value in RFC response and return HTTP 200 for SY-SUBRC equals 0, HTTP 404 for SY-SUBRC equals 4, and HTTP 500 for other values
4. WHEN RFC call throws exception, THE RFC Middleware SHALL log error with timestamp, endpoint path, and error message to console without logging passwords or JWT tokens
5. THE RFC Middleware SHALL configure connection timeout of 30 seconds in connectionParameters and implement try-catch to handle timeout errors
6. THE RFC Middleware SHALL handle 10 concurrent API requests without exceeding 5 simultaneous RFC connections by queuing requests when pool is exhausted

### Requirement 11: HTTPS Security and JWT Authentication

**User Story:** As a customer, I want my data to be transmitted securely, so that my financial information remains confidential.

#### Acceptance Criteria

1. THE RFC Middleware SHALL create HTTPS server on port 3443 using Node.js https module with self-signed certificate files server.key and server.cert for local testing
2. THE RFC Middleware SHALL implement Express middleware that validates JWT token from Authorization header using Bearer scheme and verifies signature with SECRET_KEY and checks expiry time
3. WHEN JWT token is missing or invalid, THE RFC Middleware SHALL return HTTP 401 response with JSON body containing error message "Unauthorized access"
4. THE RFC Middleware SHALL implement role-based access control middleware that checks req.user.role from decoded JWT and returns HTTP 403 for Admin-only endpoints when role is User
5. THE RFC Middleware SHALL not log passwords, JWT tokens, or customer personal data in console.log statements

### Requirement 12: Error Handling and User-Friendly Messages

**User Story:** As a customer, I want to receive clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN SAP ABAP function module raises exception of type CX_SY_OPEN_SQL_DB_ERROR, THE RFC Middleware SHALL catch exception and return HTTP 500 with JSON body containing message "System error. Please try again later."
2. WHEN business validation fails in ABAP with custom exception, THE RFC Middleware SHALL return HTTP 400 with specific error message from exception text
3. THE Customer Portal System SHALL display Material Design spinner (mat-spinner) with *ngIf="isLoading" while HTTP request is in progress
4. WHEN HTTP request fails with network error, THE Customer Portal System SHALL display error message with "Retry" button that re-executes the failed request
5. THE RFC Middleware SHALL log errors to console with format: timestamp, username from JWT, endpoint path, and error message without logging sensitive data

### Requirement 13: Material Design UI and Navigation

**User Story:** As a customer, I want the portal to have a clean, professional interface with easy navigation, so that I can access my information efficiently.

#### Acceptance Criteria

1. THE Customer Portal System SHALL install Angular Material using ng add @angular/material command and use mat-card, mat-table, mat-button, mat-spinner, and mat-form-field components
2. THE Customer Portal System SHALL display sidebar navigation with module links for Login, Profile, Inquiry, Sales Order, Invoice, Payment, Credit/Debit, and List of Delivery with icons
3. THE Customer Portal System SHALL implement lazy loading routes using loadChildren syntax for AuthModule, InvoiceModule, PaymentModule, DeliveryModule, and ProfileModule
4. THE Customer Portal System SHALL display navbar at top with KaarTech logo, user name from JWT token, and logout button aligned to right
5. THE Customer Portal System SHALL use CSS with min-width 1024px for desktop layout and display content in main area with sidebar width 250px

### Requirement 14: Angular Module Architecture and Services

**User Story:** As a developer, I want the codebase to be well-organized with clear separation of concerns, so that the application is maintainable and extensible.

#### Acceptance Criteria

1. THE Customer Portal System SHALL organize Angular code into feature modules: AuthModule in src/app/auth (not lazy loaded initially), DashboardModule in src/app/dashboard (eager loaded after login), InvoiceModule in src/app/invoice (lazy loaded), PaymentModule in src/app/payment (lazy loaded), DeliveryModule in src/app/delivery (lazy loaded), ProfileModule in src/app/profile (lazy loaded), InquiryModule in src/app/inquiry (lazy loaded), and SharedModule in src/app/shared
2. THE Customer Portal System SHALL configure app-routing.module.ts with lazy loading routes using loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule) syntax for all feature modules except AuthModule and DashboardModule
3. THE Customer Portal System SHALL create ApiService in shared folder with HttpClient for making HTTP requests to https://localhost:3443/api endpoints and feature-specific services (InvoiceService, PaymentService, DeliveryService, ProfileService, InquiryService) that use ApiService
4. THE Customer Portal System SHALL use RxJS Observables for asynchronous data flow and subscribe in components with error handling
5. THE Customer Portal System SHALL not use NgRx state management for this practice project

### Requirement 15: Performance and Data Integrity

**User Story:** As a system administrator, I want the portal to perform efficiently and maintain data integrity, so that customers have a reliable experience.

#### Acceptance Criteria

1. THE Customer Portal System SHALL load dashboard KPI cards within 3 seconds of page load under normal network conditions
2. THE Customer Portal System SHALL use database transactions in ABAP to prevent partial updates when processing payments or creating sales orders
3. THE RFC Middleware SHALL prevent concurrent payment attempts on same invoice by checking payment status before calling BAPI_PAYMENT_CREATE
4. THE Customer Portal System SHALL display loading indicators (mat-spinner) during all API calls to provide user feedback
5. THE RFC Middleware SHALL handle up to 10 concurrent API requests without degrading response time beyond 5 seconds

### Requirement 16: ABAP Function Module Standards and Best Practices

**User Story:** As a developer, I want ABAP code to follow best practices and standards, so that the backend is reliable and maintainable.

#### Acceptance Criteria

1. THE Customer Portal System SHALL name all ABAP function modules using convention Z_MODULE_ACTION_ENTITY such as Z_INVOICE_GET_LIST, Z_PAYMENT_PROCESS, Z_CUSTOMER_GET_PROFILE with parameter prefixes IV_ for importing, EV_ for exporting, IT_/ET_ for internal tables, and CV_/CS_ for changing
2. THE Customer Portal System SHALL use generic ABAP data types: C with length specification for character fields (invoice numbers, customer IDs), N with length for numeric strings, P with length and decimals for amounts, and D for dates
3. THE Customer Portal System SHALL implement TRY-CATCH-CLEANUP blocks with CATCH CX_SY_OPEN_SQL_DB_ERROR for database errors and custom exception classes for business errors
4. THE Customer Portal System SHALL check SY-SUBRC after SELECT statements and RAISE EXCEPTION when SY-SUBRC equals 4 for not found or SY-SUBRC equals 8 for errors
5. WHEN calling BAPI functions that modify data, THE Customer Portal System SHALL call BAPI_TRANSACTION_COMMIT with EXPORTING WAIT = 'X' and check SY-SUBRC, calling BAPI_TRANSACTION_ROLLBACK if commit fails
