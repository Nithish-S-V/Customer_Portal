# Implementation Plan

This implementation plan breaks down the Customer Portal O2C project into discrete, manageable coding tasks. The approach is **frontend-first**: build the complete Angular UI with mock data, then implement the backend (Node.js middleware and SAP ABAP). This allows you to see and test the UI early, then wire it up to real data. Tasks are organized by implementation phase, with optional testing sub-tasks marked with *.

## Phase 1: Angular Project Setup and Authentication UI

- [x] 1. Set up Angular project with Material Design




  - Create new Angular project using ng new customer-portal with routing enabled
  - Install Angular Material using ng add @angular/material and select a theme
  - Create SharedModule and import common Material modules (MatButtonModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatRadioModule, MatSpinnerModule)
  - Configure app.component.html with router-outlet
  - Add basic global styles in styles.css for layout (body margin, font family)
  - _Requirements: 13.1, 13.5, 14.1_

- [x] 2. Create Angular authentication module and login component




  - Generate AuthModule with ng generate module auth
  - Create LoginComponent with template containing two mat-form-fields (username, password) and login button
  - Style login page with centered card layout (400px width)
  - Add error message display area below form
  - Add loading spinner (mat-spinner) that shows during login
  - Create AuthService with login(username, password) method that returns mock Observable for now
  - Implement logout() method that clears localStorage
  - _Requirements: 1.1, 1.2, 1.5, 1.6, 13.1, 14.3_

- [x] 3. Create AuthGuard and routing configuration




  - Generate AuthGuard using ng generate guard auth/auth
  - Implement canActivate() method that checks if JWT token exists in localStorage
  - Redirect to /login if token doesn't exist
  - Configure app-routing.module.ts with routes: /login (LoginComponent), /dashboard (to be created), default redirect to /login
  - Add wildcard route that redirects to /login
  - _Requirements: 1.4, 14.1, 14.2_


## Phase 2: Dashboard and Shared Components

- [x] 4. Create shared navbar and sidebar components




  - Create NavbarComponent in SharedModule with Material toolbar (mat-toolbar)
  - Add KaarTech logo (placeholder image or text), user name display, and logout button (mat-button)
  - Style navbar with primary color background, white text, height 64px
  - Create SidebarComponent with Material sidenav list (mat-nav-list)
  - Add navigation links with Material icons for: Dashboard, Invoice, Payment, Delivery, Profile, Inquiry, Credit/Debit
  - Set sidebar width to 250px, add hover effects for links
  - Use routerLink for navigation and routerLinkActive for highlighting active route
  - _Requirements: 13.2, 13.4, 14.1_

- [x] 5. Create main layout component with sidebar and navbar




  - Create LayoutComponent in SharedModule with mat-sidenav-container
  - Include NavbarComponent at top
  - Include SidebarComponent in mat-sidenav (mode="side", opened="true")
  - Add mat-sidenav-content for main content area with router-outlet
  - Style layout: navbar fixed at top, sidebar fixed on left, content area fills remaining space
  - Update app.component.html to use LayoutComponent for authenticated routes
  - _Requirements: 13.2, 13.4, 13.5_

- [x] 6. Create TypeScript data models




  - Create shared/models folder
  - Create invoice.model.ts with Invoice and InvoiceLineItem interfaces
  - Create payment.model.ts with Payment and PaymentRequest interfaces
  - Create customer.model.ts with Customer interface
  - Create delivery.model.ts with Delivery and DeliveryLineItem interfaces
  - Create sales-order.model.ts with SalesOrder and SalesOrderLineItem interfaces
  - Create inquiry.model.ts with Inquiry interface
  - Export all models from shared module
  - _Requirements: 14.3_

- [x] 7. Create shared API service with mock data





  - Create ApiService in shared/services folder
  - Implement get(), post(), put(), delete() methods that return Observables
  - For now, return mock data using of() operator from rxjs
  - Add base URL property (will be updated later to https://localhost:3443/api)
  - Add method to get Authorization header from localStorage (returns empty string for now)
  - _Requirements: 14.3, 14.4_

## Phase 3: Dashboard and Invoice UI

- [x] 8. Create dashboard component with KPI cards




  - Generate DashboardModule and DashboardComponent
  - Create InvoiceService in invoice folder with methods: getInvoiceStats(), getRecentInvoices(count)
  - Return mock data from InvoiceService methods (use of() operator)
  - Create dashboard template with four mat-cards for KPIs: Total Invoices, Total Amount, Paid Amount, Pending Amount
  - Display KPI values with large font size (32px) and labels
  - Add section for recent invoices (5 cards) below KPIs
  - Each invoice card shows: invoice number, date, amount, status
  - Add click handler to invoice cards (will generate PDF later)
  - Add mat-spinner with *ngIf="isLoading"
  - Style cards with grid layout (2x2 for KPIs, 1 row for recent invoices)
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 13.1, 14.3_

- [x] 9. Add Finance Sheet tabs to dashboard




  - Add mat-tab-group to dashboard template with tabs: Invoice, Credit/Debit, Aging, Overall Sales
  - Set Invoice tab as default active tab
  - Add placeholder content for each tab (will be populated later)
  - Style tabs with primary color
  - _Requirements: 2.5_

- [x] 10. Create invoice list component with pagination





  - Generate InvoiceModule with ng generate module invoice
  - Create InvoiceListComponent with mat-table
  - Define table columns: Invoice Number, Amount, Date, Due Date, Status, Actions
  - Add InvoiceService method getInvoiceList(skip, top) that returns mock data (array of 60 invoices for testing pagination)
  - Implement pagination logic: currentPage, pageSize=50, totalCount
  - Add Previous and Next buttons (mat-button) below table
  - Show/hide pagination buttons based on totalCount
  - Add search input field (mat-form-field) above table
  - Implement client-side search filter by invoice number
  - Add "View Form" button (mat-icon-button with visibility icon) in Actions column
  - Add mat-spinner with *ngIf="isLoading"
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 13.1, 14.2_

- [x] 11. Configure lazy loading for invoice module





  - Update app-routing.module.ts to add lazy loaded route for invoice module
  - Use loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule)
  - Create invoice-routing.module.ts with routes for list and detail components
  - Add AuthGuard to invoice routes
  - Test navigation from sidebar to invoice list
  - _Requirements: 13.3, 14.1, 14.2_

- [x] 12. Create invoice detail component






  - Create InvoiceDetailComponent in invoice module
  - Add route parameter for invoice ID in invoice-routing.module.ts
  - Get invoice ID from ActivatedRoute params
  - Add InvoiceService method getInvoiceDetails(invoiceId) that returns mock invoice with line items
  - Display invoice header in mat-card: invoice number, customer name, date, due date, total amount, status
  - Display line items in mat-table with columns: Item #, Product Code, Description, Quantity, Unit Price, Total Price, Tax
  - Add "View Form" button at top (will implement PDF generation later)
  - Add "Back to List" button to navigate back to invoice list
  - Handle error state with error message display
  - _Requirements: 4.1, 4.2, 4.3, 12.3, 12.4_


## Phase 4: Payment UI

- [x] 13. Create payment list component





  - Generate PaymentModule with ng generate module payment
  - Create PaymentListComponent with mat-table
  - Define table columns: Payment Number, Invoice Reference, Amount, Date, Method, Status
  - Add PaymentService with getPaymentList() method that returns mock payment data
  - Display payments in table with currency pipe for amount
  - Add mat-spinner for loading state
  - Style status column with color coding (Completed: green, Pending: orange, Failed: red)
  - _Requirements: 5.1, 5.2, 13.1, 14.2, 14.3_

- [x] 14. Create payment form component




  - Create PaymentFormComponent in payment module
  - Add form fields: invoice selection (mat-select), amount (mat-input type="number"), payment method (mat-radio-group with options: Credit Card, Bank Transfer, Check, Cash)
  - Add PaymentService method getUnpaidInvoices() that returns mock unpaid invoices
  - Load unpaid invoices in dropdown on component init
  - Implement form validation: amount > 0, amount <= selected invoice balance
  - Display validation error messages below form fields
  - Add Submit button (mat-raised-button with primary color)
  - Add PaymentService method processPayment(paymentRequest) that returns mock success response
  - Display success message after submission using MatSnackBar
  - Reset form after successful payment
  - _Requirements: 5.1, 5.2, 5.3, 5.8, 13.1, 14.2, 14.3_

- [x] 15. Configure lazy loading for payment module





  - Update app-routing.module.ts to add lazy loaded route for payment module
  - Create payment-routing.module.ts with routes for list and form components
  - Add AuthGuard to payment routes
  - Add navigation links in sidebar for payment list and payment form
  - _Requirements: 13.3, 14.1, 14.2_

## Phase 5: Delivery UI

- [x] 16. Create delivery list component





  - Generate DeliveryModule with ng generate module delivery
  - Create DeliveryListComponent with mat-table
  - Define table columns: Delivery Number, Sales Order, Date, Status, Tracking Number, Actions
  - Add DeliveryService with getDeliveryList() method that returns mock delivery data
  - Add refresh button (mat-icon-button with refresh icon) above table
  - Implement refresh() method that reloads delivery list
  - Style status column with color coding (Planned: blue, In Transit: orange, Delivered: green, Cancelled: red)
  - Add "View Details" button in Actions column
  - Add mat-spinner for loading state
  - _Requirements: 7.1, 7.2, 7.4, 13.1, 14.2, 14.3_

- [x] 17. Create delivery detail component





  - Create DeliveryDetailComponent in delivery module
  - Add route parameter for delivery ID
  - Add DeliveryService method getDeliveryDetails(deliveryId) that returns mock delivery with line items
  - Display delivery header in mat-card: delivery number, sales order reference, date, status, tracking number
  - Display line items in mat-table with columns: Item #, Product Code, Description, Quantity, Shipping Info
  - Add "Download Document" button at top (will implement PDF generation later)
  - Add "Back to List" button
  - _Requirements: 7.2, 7.3, 13.1, 14.3_

- [x] 18. Configure lazy loading for delivery module





  - Update app-routing.module.ts to add lazy loaded route for delivery module
  - Create delivery-routing.module.ts with routes for list and detail components
  - Add AuthGuard to delivery routes
  - _Requirements: 13.3, 14.1, 14.2_

## Phase 6: Profile UI

- [x] 19. Create profile view component




  - Generate ProfileModule with ng generate module profile
  - Create ProfileViewComponent with mat-card layout
  - Add ProfileService with getProfile() method that returns mock customer data
  - Display profile fields in readonly mat-form-fields: Customer ID, Name, Address, City, Postal Code, Country, Email, Phone, Payment Terms, Credit Limit
  - Add "Edit Profile" button at bottom
  - Navigate to edit component when button clicked
  - _Requirements: 8.1, 8.2, 13.1, 14.2, 14.3_

- [x] 20. Create profile edit component





  - Create ProfileEditComponent in profile module
  - Display all profile fields, but only email and phone are editable (mat-input)
  - Other fields are readonly (use readonly attribute)
  - Add form validation: email format (pattern validator), phone length (10-20 characters)
  - Display validation error messages
  - Add ProfileService method updateProfile(profileData) that returns mock success response
  - Add Save button (mat-raised-button primary) and Cancel button
  - Display success message "Profile updated successfully" using MatSnackBar
  - Navigate back to view component after successful update
  - _Requirements: 8.2, 8.3, 8.5, 13.1, 14.3_

- [x] 21. Configure lazy loading for profile module




  - Update app-routing.module.ts to add lazy loaded route for profile module
  - Create profile-routing.module.ts with routes for view and edit components
  - Add AuthGuard to profile routes
  - _Requirements: 13.3, 14.1, 14.2_

## Phase 7: Inquiry and Sales Order UI

- [x] 22. Create inquiry form component





  - Generate InquiryModule with ng generate module inquiry
  - Create InquiryFormComponent with form fields: product code (mat-input), quantity (mat-input type="number"), delivery date (mat-datepicker), description (mat-textarea with maxlength 500)
  - Add character counter for description field (shows "X/500 characters")
  - Add form validation: all fields required, quantity > 0, description <= 500 chars
  - Add InquiryService with createInquiry(inquiryData) method that returns mock success response with inquiry number
  - Add Submit button (mat-raised-button primary)
  - Display success message with inquiry number using MatSnackBar
  - Reset form after successful submission
  - _Requirements: 9.1, 9.2, 13.1, 14.2, 14.3_

- [x] 23. Create sales order list component





  - Create SalesOrderListComponent in inquiry module
  - Add mat-table with columns: Order Number, Order Date, Delivery Date, Total Amount, Status, Actions
  - Add InquiryService method getSalesOrderList() that returns mock sales order data
  - Style status column with color coding (Open: blue, In Process: orange, Completed: green, Cancelled: red)
  - Add "View Details" button in Actions column
  - Add mat-spinner for loading state
  - _Requirements: 9.4, 9.5, 13.1, 14.3_

- [x] 24. Create sales order detail component





  - Create SalesOrderDetailComponent in inquiry module
  - Add route parameter for order ID
  - Add InquiryService method getSalesOrderDetails(orderId) that returns mock sales order with line items
  - Display order header in mat-card: order number, order date, delivery date, total amount, status
  - Display line items in mat-table with columns: Item #, Product Code, Description, Quantity, Unit Price, Total Price
  - Add "Back to List" button
  - _Requirements: 9.5, 9.6, 13.1, 14.3_

- [x] 25. Configure lazy loading for inquiry module





  - Update app-routing.module.ts to add lazy loaded route for inquiry module
  - Create inquiry-routing.module.ts with routes for inquiry form, sales order list, and sales order detail
  - Add AuthGuard to inquiry routes
  - Add navigation links in sidebar for inquiry form and sales orders
  - _Requirements: 9.3, 13.3, 14.1, 14.2_

## Phase 8: Credit/Debit UI

- [x] 26. Create credit/debit component





  - Add CreditDebitComponent to invoice module (or create separate module)
  - Add mat-tab-group with two tabs: Credit Notes, Debit Notes
  - Create mat-table for each tab with columns: Document Number, Invoice Reference, Amount, Reason, Date, Actions
  - Add InvoiceService methods: getCreditDebitList(docType) that returns mock data
  - Filter data by docType ('CREDIT' or 'DEBIT') based on active tab
  - Add "View Details" button in Actions column
  - Add "Request Credit/Debit" button above table (only show if user role is Admin)
  - Check user role from JWT token in localStorage
  - Clicking "Request Credit/Debit" opens inquiry form
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 13.1, 14.3_

- [x] 27. Create credit/debit detail component





  - Create CreditDebitDetailComponent in invoice module
  - Add route parameter for document ID
  - Add InvoiceService method getCreditDebitDetails(documentId) that returns mock document with line items
  - Display document header in mat-card: document number, type, invoice reference, amount, reason, date
  - Display line items in mat-table with columns: Item #, Product Code, Description, Quantity, Amount
  - Add "Back to List" button
  - _Requirements: 6.3, 6.4, 13.1, 14.3_

## Phase 9: Error Handling and Polish

- [x] 28. Implement HTTP error interceptor





  - Create ErrorInterceptor in shared folder implementing HttpInterceptor
  - Handle different error status codes: 401 (redirect to login), 403 (permission denied), 404 (not found), 500 (system error)
  - Display user-friendly error messages for each error type
  - For 401 errors, clear localStorage and redirect to login page
  - Return throwError with formatted error message
  - Register interceptor in app.module.ts providers
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 29. Add error display and retry functionality to all components





  - Add errorMessage property and showRetry flag to all list components
  - Display error message in mat-card with error styling (red background)
  - Add "Retry" button (mat-button) below error message
  - Implement onRetry() method that clears error and re-executes API call
  - Test error handling by temporarily returning throwError from service methods
  - _Requirements: 12.3, 12.4_

- [x] 30. Implement loading states consistently





  - Ensure all components have isLoading property
  - Show mat-spinner with *ngIf="isLoading" during API calls
  - Set isLoading=true before API call, isLoading=false in subscribe complete/error
  - Center spinner in component using flexbox
  - Add overlay with semi-transparent background for better UX
  - _Requirements: 12.3, 15.4_

- [x] 31. Add form validation and user feedback





  - Review all forms (login, payment, profile edit, inquiry) for validation
  - Add mat-error elements below form fields with validation messages
  - Disable submit buttons when form is invalid
  - Show success messages using MatSnackBar after successful operations
  - Set snackbar duration to 3 seconds
  - Use green background for success, red for error messages
  - _Requirements: 8.3, 9.1, 12.2_

- [ ]* 31.1 Test frontend UI manually
  - Test all navigation links work correctly
  - Test lazy loading modules load on first navigation
  - Test pagination works with > 50 records
  - Test search filters correctly
  - Test form validation prevents invalid submissions
  - Test error messages display correctly
  - Test loading spinners show during operations
  - Test responsive layout on different screen sizes
  - _Requirements: All frontend requirements_

## Phase 10: Backend - Node.js Middleware Setup

- [x] 32. Set up Node.js Express project with HTTPS





  - Create new Node.js project: mkdir middleware && cd middleware && npm init -y
  - Install dependencies: express, https, dotenv, jsonwebtoken, node-rfc, cors, body-parser
  - Create server.js as entry point
  - Generate self-signed SSL certificate: openssl genrsa -out server.key 2048 && openssl req -new -key server.key -out server.csr && openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
  - Create HTTPS server on port 3443 with certificate files
  - Configure CORS to allow requests from http://localhost:4200
  - Add body-parser middleware for JSON parsing
  - Create .env file with SAP_HOST, SAP_PORT, SAP_USER, SAP_PASSWORD, SAP_CLIENT, SAP_LANG, JWT_SECRET
  - Test server starts successfully
  - _Requirements: 10.1, 11.1_

- [ ] 33. Implement RFC connection pool service
  - Create services/rfc-pool.service.js
  - Import Pool from node-rfc library
  - Configure connection parameters from environment variables
  - Initialize pool with 5 connections using rfcPool.open(5)
  - Export rfcPool instance
  - Create services/rfc-call.service.js with callRfcFunction(functionName, parameters) wrapper
  - Implement acquire/release pattern with try-finally block
  - Add SY-SUBRC checking: return HTTP 200 for 0, HTTP 404 for 4, HTTP 500 for others
  - Add error logging with timestamp and endpoint
  - Test RFC connection to SAP system
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 34. Implement JWT authentication middleware
  - Create middleware/auth.middleware.js
  - Implement function that extracts token from Authorization header (Bearer scheme)
  - Verify token using jwt.verify() with JWT_SECRET
  - Decode token and attach user object to req.user
  - Return HTTP 401 if token is missing or invalid
  - Create middleware/rbac.middleware.js with requireRole(allowedRoles) function
  - Check req.user.role against allowed roles
  - Return HTTP 403 if role not allowed
  - _Requirements: 1.3, 1.4, 11.2, 11.3, 11.4_

- [ ] 35. Implement authentication routes
  - Create routes/auth.routes.js
  - Implement POST /api/auth/login endpoint
  - For now, use hardcoded user validation (username: 'testuser', password: 'testpass', role: 'Admin')
  - Generate JWT token with 8-hour expiry using jwt.sign()
  - Include username, role, customerId in token payload
  - Return token and user info in response
  - Implement POST /api/auth/logout endpoint (just returns success message)
  - Add routes to Express app in server.js
  - Test login endpoint with Postman or curl
  - _Requirements: 1.1, 1.2, 1.3, 11.2_

- [ ] 36. Update Angular to use real authentication API
  - Update ApiService base URL to 'https://localhost:3443/api'
  - Update proxy.conf.json to proxy /api to https://localhost:3443
  - Update AuthService login() method to call real POST /api/auth/login endpoint
  - Store returned token in localStorage
  - Update ApiService to add Authorization header with token from localStorage
  - Test login flow end-to-end: Angular → Middleware → Mock validation → Token returned → Dashboard loads
  - _Requirements: 1.1, 1.2, 1.5, 14.3_

## Phase 11: Backend - Invoice APIs

- [ ] 37. Implement invoice API endpoints with mock data
  - Create routes/invoice.routes.js
  - Implement GET /api/invoice/list with query params skip and top
  - Return mock invoice data (array of 60 invoices) with pagination
  - Implement GET /api/invoice/:id returning mock invoice with line items
  - Implement GET /api/invoice/stats returning mock KPI statistics
  - Add auth middleware to all routes
  - Add error handling middleware
  - Register routes in server.js
  - Test endpoints with Postman
  - _Requirements: 2.2, 3.2, 4.1, 10.2, 10.3_

- [ ] 38. Update Angular invoice services to use real APIs
  - Update InvoiceService methods to call real API endpoints
  - Remove mock data from service methods
  - Test invoice list loads from API
  - Test pagination works with API
  - Test invoice detail loads from API
  - Test dashboard KPI cards load from API
  - Test error handling when API returns error
  - _Requirements: 2.2, 3.2, 4.1, 12.3, 12.4_

## Phase 12: Backend - Payment APIs

- [ ] 39. Implement payment API endpoints with mock data
  - Create routes/payment.routes.js
  - Implement GET /api/payment/list returning mock payment data
  - Implement POST /api/payment/process with request body validation
  - Validate amount > 0 and amount <= invoice balance (mock validation for now)
  - Return HTTP 400 if validation fails with error message
  - Return HTTP 200 with payment number on success
  - Add auth middleware to all routes
  - Register routes in server.js
  - Test endpoints with Postman
  - _Requirements: 5.1, 5.3, 5.4, 10.2, 10.3, 12.2_

- [ ] 40. Update Angular payment services to use real APIs
  - Update PaymentService methods to call real API endpoints
  - Remove mock data from service methods
  - Test payment list loads from API
  - Test payment form submission calls API
  - Test validation error messages display correctly
  - Test success message displays after payment
  - _Requirements: 5.1, 5.3, 5.8, 12.3, 12.4_

## Phase 13: Backend - Delivery, Profile, Inquiry APIs

- [ ] 41. Implement delivery API endpoints with mock data
  - Create routes/delivery.routes.js
  - Implement GET /api/delivery/list, GET /api/delivery/:id
  - Return mock delivery data
  - Add auth middleware
  - Register routes in server.js
  - Update Angular DeliveryService to use real APIs
  - Test delivery list and detail load from API
  - _Requirements: 7.1, 7.3, 10.2, 10.3_

- [ ] 42. Implement profile API endpoints with mock data
  - Create routes/profile.routes.js
  - Implement GET /api/profile, PUT /api/profile
  - Return mock customer data
  - Validate email format and phone length in PUT endpoint
  - Add auth middleware
  - Register routes in server.js
  - Update Angular ProfileService to use real APIs
  - Test profile view and update work with API
  - _Requirements: 8.1, 8.4, 10.2, 10.3, 12.2_

- [ ] 43. Implement inquiry and sales order API endpoints with mock data
  - Create routes/inquiry.routes.js
  - Implement POST /api/inquiry/create, GET /api/salesorder/list, GET /api/salesorder/:id
  - Validate inquiry form data (quantity > 0, description <= 500 chars)
  - Return mock data
  - Add auth middleware
  - Register routes in server.js
  - Update Angular InquiryService to use real APIs
  - Test inquiry submission and sales order list/detail work with API
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 10.2, 10.3, 12.2_

- [ ] 44. Implement credit/debit API endpoints with mock data
  - Create routes/creditdebit.routes.js
  - Implement GET /api/creditdebit/list with query param docType, GET /api/creditdebit/:id
  - Return mock credit/debit data filtered by docType
  - Add auth middleware
  - Add RBAC middleware to POST /api/creditdebit/request (Admin only)
  - Register routes in server.js
  - Update Angular InvoiceService to use real APIs for credit/debit
  - Test credit/debit list and detail work with API
  - _Requirements: 6.1, 6.2, 6.4, 10.2, 10.3, 11.4_

## Phase 14: Backend - SAP ABAP Function Modules

- [ ] 45. Create ABAP authentication function module
  - Create Smart Form ZSF_INVOICE in transaction SMARTFORMS
  - Design form layout with header window containing company logo and invoice details
  - Add main window with table for line items (columns: item number, product code, description, quantity, unit price, total)
  - Add footer window with subtotal, tax, and total amount
  - Define form interface with WA_INVOICE structure and IT_LINE_ITEMS table
  - Test form generation with sample data in SMARTFORMS transaction
  - _Requirements: 4.4, 4.5_

- [ ] 13. Implement ABAP Smart Form generation function
  - Create Z_INVOICE_CREATE_FORM in function group ZCUSTPRTL_INVOICE
  - Add importing parameter IV_INVOICE_ID (C 10) and exporting parameter EV_PDF_BLOB (XSTRING)
  - Fetch invoice data from ZINVOICES and ZINVOICE_ITEMS tables
  - Call SSF_FUNCTION_MODULE_NAME to get generated function module name for ZSF_INVOICE
  - Check SY-SUBRC and raise exception if Smart Form not found
  - Call generated Smart Form function module with invoice data via WA_INVOICE parameter
  - Convert OTF output to PDF using CONVERT_OTF_TO_PDF function
  - Return PDF as XSTRING in EV_PDF_BLOB
  - _Requirements: 4.4, 4.5, 4.6, 15.3, 15.4_

- [ ] 14. Implement PDF generation endpoint in middleware
  - Add GET /api/invoice/:id/form route in invoice.routes.js
  - Call Z_INVOICE_CREATE_FORM with invoice ID parameter
  - Convert XSTRING PDF blob to Buffer
  - Set response headers: Content-Type: application/pdf, Content-Disposition: inline
  - Send PDF buffer in response
  - Handle errors and return HTTP 500 with message "Failed to generate form. Smart Form template may not exist."
  - _Requirements: 4.5, 4.6, 4.7, 12.1_

- [ ] 15. Implement PDF viewing in Angular
  - Add generateInvoiceForm(invoiceId) method to InvoiceService
  - Configure HttpClient to receive blob response type
  - In DashboardComponent and InvoiceListComponent, call generateInvoiceForm() when user clicks invoice card or "View Form" button
  - Create blob URL using window.URL.createObjectURL(blob)
  - Open PDF in new browser tab using window.open(url, '_blank')
  - Handle error state and display error message if PDF generation fails
  - _Requirements: 2.4, 4.7, 12.3, 12.4_

- [ ]* 15.1 Test Smart Form generation end-to-end
  - Manually test PDF generation for multiple invoices
  - Verify PDF displays correct invoice data and line items
  - Test error handling when invoice ID doesn't exist
  - Test error handling when Smart Form template is missing
  - _Requirements: 4.4, 4.5, 4.6, 4.7_


## Phase 4: Payment Processing

- [ ] 16. Create ABAP payment function modules
  - Create function group ZCUSTPRTL_PAYMENT in transaction SE80
  - Implement Z_PAYMENT_GET_LIST with parameter IV_CUSTOMER_ID (C 10) and table ET_PAYMENTS
  - Create table ZPAYMENTS with fields: payment_number (C 10 key), invoice_reference (C 10), customer_id (C 10), amount (P 15 decimals 2), currency (C 3), payment_date (D), payment_method (C 20), status (C 20)
  - Implement Z_PAYMENT_PROCESS with parameters IV_INVOICE_ID (C 10), IV_AMOUNT (P 15 decimals 2), IV_METHOD (C 20), exporting EV_PAYMENT_NUMBER (C 10)
  - In Z_PAYMENT_PROCESS, call Z_INVOICE_GET_DETAILS to verify invoice balance
  - Validate payment amount <= invoice balance, raise exception if exceeds
  - Validate currency matches invoice currency
  - Call BAPI_PAYMENT_CREATE (or custom payment creation logic)
  - Call BAPI_TRANSACTION_COMMIT with WAIT='X' after successful payment creation
  - Call BAPI_TRANSACTION_ROLLBACK if commit fails
  - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6, 5.7, 15.2, 15.5_

- [ ] 17. Implement payment API endpoints in middleware
  - Create payment.routes.js with GET /api/payment/list and POST /api/payment/process endpoints
  - Implement GET /api/payment/list calling Z_PAYMENT_GET_LIST
  - Implement POST /api/payment/process with request body validation (invoiceId, amount, method)
  - Validate amount > 0 before calling ABAP function
  - Call Z_PAYMENT_PROCESS and handle SY-SUBRC checking
  - Return HTTP 400 if payment amount exceeds balance with message "Payment amount exceeds invoice balance"
  - Return HTTP 200 with payment number on success
  - Add auth middleware to all payment routes
  - _Requirements: 5.1, 5.3, 5.4, 5.6, 5.7, 10.2, 10.3, 12.2_

- [ ] 18. Create Angular payment module and components
  - Generate PaymentModule with lazy loading route configuration
  - Create PaymentListComponent to display payment history in mat-table
  - Create PaymentFormComponent with form fields for invoice selection (mat-select), amount (mat-input type="number"), and payment method (mat-radio-group)
  - Create PaymentService with methods getPaymentList() and processPayment(paymentRequest)
  - In PaymentFormComponent, load unpaid invoices for dropdown selection
  - Validate amount > 0 and amount <= selected invoice balance
  - Display error message if validation fails
  - Call PaymentService.processPayment() on form submission
  - Display success message and refresh payment list after successful payment
  - _Requirements: 5.1, 5.2, 5.3, 5.8, 13.1, 14.2, 14.3_

- [ ]* 18.1 Write integration tests for payment processing
  - Test payment creation with valid data succeeds
  - Test payment with amount exceeding balance returns 400 error
  - Test payment with amount <= 0 returns 400 error
  - Test payment list retrieval returns correct data
  - _Requirements: 5.3, 5.4, 5.6, 5.7_


## Phase 5: Delivery Tracking

- [ ] 19. Create ABAP delivery function modules
  - Create function group ZCUSTPRTL_DELIVERY in transaction SE80
  - Implement Z_DELIVERY_GET_LIST with parameter IV_CUSTOMER_ID (C 10) and table ET_DELIVERIES
  - Implement Z_DELIVERY_GET_DETAILS with parameter IV_DELIVERY_ID (C 10) and table ET_LINE_ITEMS
  - Implement Z_DELIVERY_CREATE_FORM with parameter IV_DELIVERY_ID (C 10) and exporting EV_PDF_BLOB (XSTRING)
  - Create table ZDELIVERIES with fields: delivery_number (C 10 key), sales_order_reference (C 10), customer_id (C 10), delivery_date (D), status (C 20), tracking_number (C 30)
  - Create table ZDELIVERY_ITEMS with fields: delivery_number (C 10 key), item_number (N 6 key), product_code (C 18), description (C 100), quantity (P 13 decimals 3), shipping_info (C 100)
  - Check SY-SUBRC after SELECT statements and raise exceptions for not found
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 15.1, 15.2, 15.4_

- [ ] 20. Create Smart Form template for delivery documents
  - Create Smart Form ZSF_DELIVERY in transaction SMARTFORMS
  - Design form layout with delivery header (delivery number, sales order, date, tracking number)
  - Add table for line items with columns: item number, product code, description, quantity, shipping info
  - Define form interface with WA_DELIVERY structure and IT_LINE_ITEMS table
  - Test form generation with sample delivery data
  - _Requirements: 7.5_

- [ ] 21. Implement delivery API endpoints in middleware
  - Create delivery.routes.js with GET /api/delivery/list, GET /api/delivery/:id, and GET /api/delivery/:id/form endpoints
  - Implement GET /api/delivery/list calling Z_DELIVERY_GET_LIST
  - Implement GET /api/delivery/:id calling Z_DELIVERY_GET_DETAILS
  - Implement GET /api/delivery/:id/form calling Z_DELIVERY_CREATE_FORM and returning PDF blob
  - Add auth middleware to all delivery routes
  - Handle errors and map to appropriate HTTP status codes
  - _Requirements: 7.1, 7.3, 7.5, 10.2, 10.3_

- [ ] 22. Create Angular delivery module and components
  - Generate DeliveryModule with lazy loading route configuration
  - Create DeliveryListComponent to display deliveries in mat-table with columns: delivery number, sales order, date, status, tracking number
  - Create DeliveryDetailComponent to display delivery header and line items
  - Create DeliveryService with methods getDeliveryList(), getDeliveryDetails(deliveryId), and generateDeliveryForm(deliveryId)
  - Add refresh button in DeliveryListComponent to reload delivery list
  - Add "Download Document" button to generate and open delivery PDF
  - Display status with color coding (Planned: blue, In Transit: orange, Delivered: green)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 13.1, 14.2, 14.3_


## Phase 6: Customer Profile Management

- [ ] 23. Create ABAP customer profile function modules
  - Create function group ZCUSTPRTL_CUSTOMER in transaction SE80
  - Implement Z_CUSTOMER_GET_PROFILE with parameter IV_CUSTOMER_ID (C 10) and exporting structure ES_CUSTOMER
  - Implement Z_CUSTOMER_UPDATE_PROFILE with parameter IV_CUSTOMER_ID (C 10) and changing structure CS_CUSTOMER
  - Create table ZCUSTOMERS with fields: customer_id (C 10 key), name (C 100), address (C 200), city (C 50), postal_code (C 10), country (C 3), email (C 100), phone (C 20), payment_terms (C 20), credit_limit (P 15 decimals 2)
  - In Z_CUSTOMER_UPDATE_PROFILE, update only email and phone fields
  - Check SY-SUBRC after UPDATE and raise exception if update fails
  - Insert sample customer data for testing
  - _Requirements: 8.1, 8.2, 8.4, 15.1, 15.2, 15.4_

- [ ] 24. Implement profile API endpoints in middleware
  - Create profile.routes.js with GET /api/profile and PUT /api/profile endpoints
  - Implement GET /api/profile calling Z_CUSTOMER_GET_PROFILE with customer ID from JWT token
  - Implement PUT /api/profile with request body validation for email and phone
  - Validate email format using regex pattern
  - Validate phone number length (10-20 characters)
  - Call Z_CUSTOMER_UPDATE_PROFILE with updated fields
  - Return HTTP 200 with success message on successful update
  - Add auth middleware to all profile routes
  - _Requirements: 8.1, 8.3, 8.4, 10.2, 10.3, 12.2_

- [ ] 25. Create Angular profile module and components
  - Generate ProfileModule with lazy loading route configuration
  - Create ProfileViewComponent to display customer profile in read-only format
  - Create ProfileEditComponent with editable form fields for email and phone
  - Create ProfileService with methods getProfile() and updateProfile(profileData)
  - Display profile fields in mat-form-fields with readonly attribute for non-editable fields
  - Add "Edit Profile" button to enable editing mode
  - Validate email format and phone number length before submission
  - Display success message "Profile updated successfully" after successful update
  - Refresh profile data after update
  - _Requirements: 8.1, 8.2, 8.3, 8.5, 13.1, 14.2, 14.3_


## Phase 7: Inquiry and Sales Order Management

- [ ] 26. Create ABAP inquiry and sales order function modules
  - Create function group ZCUSTPRTL_INQUIRY in transaction SE80
  - Implement Z_INQUIRY_CREATE with parameters IV_CUSTOMER_ID (C 10), IV_PRODUCT_CODE (C 18), IV_QUANTITY (P 13 decimals 3), IV_DELIVERY_DATE (D), IV_DESCRIPTION (C 500), exporting EV_INQUIRY_NUMBER (C 10)
  - Implement Z_SALESORDER_GET_LIST with parameter IV_CUSTOMER_ID (C 10) and table ET_SALES_ORDERS
  - Implement Z_SALESORDER_GET_DETAILS with parameter IV_ORDER_ID (C 10) and table ET_LINE_ITEMS
  - Create table ZINQUIRIES with fields: inquiry_number (C 10 key), customer_id (C 10), product_code (C 18), quantity (P 13 decimals 3), delivery_date (D), description (C 500), status (C 20), created_at (TIMESTAMP)
  - Create table ZSALES_ORDERS with fields: order_number (C 10 key), customer_id (C 10), order_date (D), delivery_date (D), total_amount (P 15 decimals 2), status (C 20)
  - Create table ZSALESORDER_ITEMS with fields: order_number (C 10 key), item_number (N 6 key), product_code (C 18), description (C 100), quantity (P 13 decimals 3), unit_price (P 15 decimals 2), total_price (P 15 decimals 2)
  - Generate unique inquiry number using number range or timestamp
  - Check SY-SUBRC after INSERT and raise exception if insert fails
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 15.1, 15.2, 15.4_

- [ ] 27. Implement inquiry API endpoints in middleware
  - Create inquiry.routes.js with POST /api/inquiry/create, GET /api/salesorder/list, and GET /api/salesorder/:id endpoints
  - Implement POST /api/inquiry/create with request body validation (productCode, quantity > 0, deliveryDate, description max 500 chars)
  - Call Z_INQUIRY_CREATE with validated parameters
  - Return HTTP 200 with inquiry number on success
  - Implement GET /api/salesorder/list calling Z_SALESORDER_GET_LIST
  - Implement GET /api/salesorder/:id calling Z_SALESORDER_GET_DETAILS
  - Add auth middleware to all inquiry routes
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 10.2, 10.3, 12.2_

- [ ] 28. Create Angular inquiry module and components
  - Generate InquiryModule with lazy loading route configuration
  - Create InquiryFormComponent with form fields for product code (mat-input), quantity (mat-input type="number"), delivery date (mat-datepicker), description (mat-textarea with maxlength 500)
  - Create SalesOrderListComponent to display sales orders in mat-table with columns: order number, order date, delivery date, total amount, status
  - Create SalesOrderDetailComponent to display order header and line items
  - Create InquiryService with methods createInquiry(inquiryData), getSalesOrderList(), and getSalesOrderDetails(orderId)
  - Validate quantity > 0 and description <= 500 characters before submission
  - Display success message with inquiry number after successful submission
  - Display sales orders with status color coding (Open: blue, In Process: orange, Completed: green, Cancelled: red)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 13.1, 14.2, 14.3_


## Phase 8: Credit/Debit Note Management

- [ ] 29. Create ABAP credit/debit function modules
  - Create function group ZCUSTPRTL_CREDITDEBIT in transaction SE80
  - Implement Z_CREDITDEBIT_GET_LIST with parameters IV_CUSTOMER_ID (C 10), IV_DOC_TYPE (C 10 with values 'CREDIT' or 'DEBIT'), and table ET_DOCUMENTS
  - Implement Z_CREDITDEBIT_GET_DETAILS with parameter IV_DOCUMENT_ID (C 10) and table ET_LINE_ITEMS
  - Create table ZCREDITDEBIT with fields: document_number (C 10 key), document_type (C 10), customer_id (C 10), invoice_reference (C 10), amount (P 15 decimals 2), reason_code (C 20), creation_date (D), status (C 20)
  - Create table ZCREDITDEBIT_ITEMS with fields: document_number (C 10 key), item_number (N 6 key), product_code (C 18), description (C 100), quantity (P 13 decimals 3), amount (P 15 decimals 2)
  - Filter by document_type in Z_CREDITDEBIT_GET_LIST
  - Check SY-SUBRC and raise exception if not found
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 15.1, 15.2, 15.4_

- [ ] 30. Implement credit/debit API endpoints in middleware
  - Create creditdebit.routes.js with GET /api/creditdebit/list and GET /api/creditdebit/:id endpoints
  - Implement GET /api/creditdebit/list with query parameter docType ('CREDIT' or 'DEBIT')
  - Call Z_CREDITDEBIT_GET_LIST with customer ID from JWT and docType parameter
  - Implement GET /api/creditdebit/:id calling Z_CREDITDEBIT_GET_DETAILS
  - Add auth middleware to all credit/debit routes
  - Add RBAC middleware to POST /api/creditdebit/request endpoint (Admin role only)
  - _Requirements: 6.1, 6.2, 6.4, 6.5, 10.2, 10.3, 11.4_

- [ ] 31. Create Angular credit/debit components
  - Add CreditDebitComponent to InvoiceModule (or create separate module)
  - Display Credit/Debit tab on Finance Sheet with toggle to switch between credit and debit notes
  - Create mat-table to display document number, reference invoice, amount, reason code, creation date
  - Call InvoiceService.getCreditDebitList(docType) with 'CREDIT' or 'DEBIT' parameter
  - Display detail view when user clicks on document row
  - Show "Request Credit/Debit" button only when user role is Admin (check JWT token)
  - Open inquiry form when Admin clicks "Request Credit/Debit" button
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 13.1, 14.3_


## Phase 9: Shared Components and Navigation

- [ ] 32. Create shared navbar and sidebar components
  - Create NavbarComponent in SharedModule with KaarTech logo, user name display, and logout button
  - Get user name from JWT token stored in localStorage
  - Implement logout() method that calls AuthService.logout()
  - Create SidebarComponent with navigation links for all modules (Login, Profile, Inquiry, Sales Order, Invoice, Payment, Credit/Debit, Delivery)
  - Add Material icons for each navigation link
  - Highlight active route using routerLinkActive directive
  - Set sidebar width to 250px with fixed positioning
  - _Requirements: 13.2, 13.4, 14.1_

- [ ] 33. Configure lazy loading routes
  - Update app-routing.module.ts with lazy loading configuration for all feature modules
  - Use loadChildren syntax: loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule)
  - Configure routes for InvoiceModule, PaymentModule, DeliveryModule, ProfileModule, InquiryModule
  - Add AuthGuard to all protected routes
  - Set default redirect to /login for empty path
  - Set wildcard route to redirect to /login
  - _Requirements: 13.3, 14.1, 14.2_

- [ ] 34. Create shared API service and models
  - Create ApiService in SharedModule with HttpClient wrapper
  - Implement get(), post(), put(), delete() methods with base URL https://localhost:3443/api
  - Add Authorization header with JWT token from localStorage to all requests
  - Create TypeScript interfaces in shared/models folder: Invoice, InvoiceLineItem, Payment, Customer, Delivery, SalesOrder, Inquiry
  - Export all models from shared module
  - _Requirements: 14.3, 14.4_

- [ ] 35. Implement error handling and loading states
  - Create HTTP error interceptor to handle 401, 403, 404, 500 errors
  - Redirect to login page on 401 Unauthorized
  - Display user-friendly error messages for each error type
  - Add mat-spinner to all components during data loading
  - Add error message display area with retry button in all list components
  - Implement retry logic that re-executes failed API call
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 15.4_

- [ ]* 35.1 Write end-to-end manual tests
  - Test complete login flow with valid and invalid credentials
  - Test dashboard loads with correct KPI data
  - Test invoice list pagination and search
  - Test invoice PDF generation
  - Test payment processing with validation
  - Test profile view and update
  - Test delivery tracking
  - Test inquiry submission and sales order tracking
  - Test logout clears token and redirects
  - _Requirements: All requirements_


## Phase 10: Performance Optimization and Final Integration

- [ ] 36. Optimize RFC connection pool and error handling
  - Review RFC connection pool configuration and ensure 5 connections are maintained
  - Implement connection timeout of 30 seconds in connectionParameters
  - Add retry logic for transient RFC failures (max 2 retries)
  - Ensure all RFC calls use try-finally pattern to release connections
  - Add comprehensive error logging with timestamp, endpoint, and error message
  - Verify no passwords or tokens are logged
  - _Requirements: 10.1, 10.4, 10.5, 10.6, 11.5, 15.4_

- [ ] 37. Implement performance monitoring and optimization
  - Add console logging for API response times
  - Verify dashboard loads in < 3 seconds
  - Verify invoice list (50 records) loads in < 2 seconds
  - Optimize ABAP SELECT statements with proper indexes
  - Test concurrent request handling (10 simultaneous requests)
  - Verify RFC pool queues requests when all 5 connections are busy
  - _Requirements: 3.8, 10.6, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 38. Create ABAP exception classes
  - Create exception class ZCX_INVOICE_ERROR in transaction SE24 inheriting from CX_STATIC_CHECK
  - Define text IDs for INVOICE_NOT_FOUND, DATABASE_ERROR, SMARTFORM_NOT_FOUND, FORM_GENERATION_ERROR, PDF_CONVERSION_ERROR
  - Create exception class ZCX_PAYMENT_ERROR with text IDs for PAYMENT_FAILED, INVALID_AMOUNT, BALANCE_EXCEEDED
  - Create exception class ZCX_NO_AUTHORIZATION with text ID for UNAUTHORIZED_ACCESS
  - Create exception class ZCX_DB_ERROR for database errors
  - Use these exception classes in all ABAP function modules
  - _Requirements: 12.1, 15.3, 15.4_

- [ ] 39. Add sample data and testing utilities
  - Insert comprehensive sample data for all tables (ZINVOICES, ZPAYMENTS, ZDELIVERIES, ZCUSTOMERS, ZSALES_ORDERS, ZINQUIRIES, ZCREDITDEBIT)
  - Create at least 50 invoices with line items for pagination testing
  - Create sample payments, deliveries, sales orders for each customer
  - Create test users with Admin and User roles
  - Document sample credentials in README.md
  - _Requirements: 3.2, 3.8_

- [ ] 40. Final integration testing and documentation
  - Test complete user journey from login to logout
  - Verify all API endpoints return correct data
  - Verify all error scenarios display appropriate messages
  - Test role-based access control (Admin vs User)
  - Verify JWT token expiry after 8 hours
  - Test pagination works correctly with > 50 records
  - Verify PDF generation works for invoices and deliveries
  - Test payment validation prevents amount > balance
  - Document API endpoints in README.md
  - Document environment setup in README.md
  - Create user guide with screenshots
  - _Requirements: All requirements_

- [ ]* 40.1 Create deployment documentation
  - Document Node.js middleware setup and configuration
  - Document Angular build and deployment steps
  - Document SAP function module deployment
  - Document database table creation
  - Document Smart Form creation
  - Create troubleshooting guide
  - _Requirements: All requirements_


## Phase 14: Backend - SAP ABAP Function Modules

- [ ] 45. Create ABAP authentication function module
  - Create function group ZCUSTPRTL_AUTH in transaction SE80
  - Implement Z_RFC_VALIDATE_USER with importing parameters IV_USERNAME (C 20) and IV_PASSWORD (C 20)
  - Add exporting parameters EV_VALID (C 1) and EV_ROLE (C 10)
  - Create table ZUSERS with fields: username (C 20 key), password (C 20), role (C 10), customer_id (C 10)
  - Insert test users: ('testuser', 'testpass', 'Admin', '1000'), ('user1', 'pass1', 'User', '1001')
  - Implement SELECT from ZUSERS where username and password match
  - Check SY-SUBRC: if 0, set EV_VALID='X' and EV_ROLE from table; else set EV_VALID=' '
  - Add TRY-CATCH block for database errors
  - Test function module in SE37
  - _Requirements: 1.1, 1.2, 15.1, 15.2, 15.3, 15.4_

- [ ] 46. Update middleware to call Z_RFC_VALIDATE_USER
  - Update POST /api/auth/login to call Z_RFC_VALIDATE_USER via RFC
  - Pass username and password from request body
  - Check EV_VALID='X' for successful authentication
  - Get role from EV_ROLE
  - Generate JWT token with username, role, customerId
  - Return token if valid, HTTP 401 if invalid
  - Test login with real SAP authentication
  - _Requirements: 1.1, 1.2, 10.2, 10.3_

- [ ] 47. Create ABAP invoice function modules and database tables
  - Create function group ZCUSTPRTL_INVOICE in transaction SE80
  - Create table ZINVOICES in SE11 with fields: invoice_number (C 10 key), customer_id (C 10), customer_name (C 50), amount (P 15 decimals 2), currency (C 3), invoice_date (D), due_date (D), status (C 20)
  - Create table ZINVOICE_ITEMS with fields: invoice_number (C 10 key), item_number (N 6 key), product_code (C 18), description (C 100), quantity (P 13 decimals 3), unit_price (P 15 decimals 2), total_price (P 15 decimals 2), tax (P 15 decimals 2)
  - Insert sample data: 60 invoices with line items for customer '1000'
  - Implement Z_INVOICE_GET_LIST with parameters IV_CUSTOMER_ID (C 10), IV_SKIP (I), IV_TOP (I), exporting EV_TOTAL_COUNT (I), table ET_INVOICES
  - Use SELECT with OFFSET IV_SKIP LENGTH IV_TOP for pagination
  - Check SY-SUBRC and raise exception if error
  - Test function module in SE37
  - _Requirements: 2.2, 3.2, 3.3, 15.1, 15.2, 15.4_

- [ ] 48. Implement remaining invoice ABAP function modules
  - Implement Z_INVOICE_GET_DETAILS with parameter IV_INVOICE_ID (C 10), exporting EV_TOTAL_AMOUNT (P 15 decimals 2), table ET_LINE_ITEMS
  - SELECT from ZINVOICES and ZINVOICE_ITEMS
  - Check SY-SUBRC: if 4, raise ZCX_INVOICE_ERROR for not found
  - Implement Z_INVOICE_GET_STATS with parameter IV_CUSTOMER_ID (C 10), exporting EV_TOTAL_COUNT, EV_TOTAL_AMOUNT, EV_PAID_AMOUNT, EV_PENDING_AMOUNT
  - Calculate statistics using SELECT COUNT, SUM with WHERE conditions
  - Test function modules in SE37
  - _Requirements: 2.2, 4.1, 4.2, 15.4_

- [ ] 49. Update middleware invoice routes to call ABAP functions
  - Update GET /api/invoice/list to call Z_INVOICE_GET_LIST
  - Update GET /api/invoice/:id to call Z_INVOICE_GET_DETAILS
  - Update GET /api/invoice/stats to call Z_INVOICE_GET_STATS
  - Remove mock data
  - Handle SY-SUBRC errors and map to HTTP status codes
  - Test invoice APIs return real SAP data
  - Test Angular invoice list and detail display real data
  - _Requirements: 2.2, 3.2, 4.1, 10.2, 10.3, 12.1_

- [ ] 50. Create ABAP payment function modules and database tables
  - Create function group ZCUSTPRTL_PAYMENT in transaction SE80
  - Create table ZPAYMENTS with fields: payment_number (C 10 key), invoice_reference (C 10), customer_id (C 10), amount (P 15 decimals 2), currency (C 3), payment_date (D), payment_method (C 20), status (C 20)
  - Insert sample payment data
  - Implement Z_PAYMENT_GET_LIST with parameter IV_CUSTOMER_ID (C 10), table ET_PAYMENTS
  - Implement Z_PAYMENT_PROCESS with parameters IV_INVOICE_ID (C 10), IV_AMOUNT (P 15 decimals 2), IV_METHOD (C 20), exporting EV_PAYMENT_NUMBER (C 10)
  - In Z_PAYMENT_PROCESS: call Z_INVOICE_GET_DETAILS to verify balance, validate amount <= balance, generate payment number, INSERT into ZPAYMENTS
  - Call BAPI_TRANSACTION_COMMIT with WAIT='X' after INSERT
  - Check SY-SUBRC after INSERT and COMMIT, call BAPI_TRANSACTION_ROLLBACK if error
  - Test function modules in SE37
  - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7, 15.2, 15.4, 15.5_

- [ ] 51. Update middleware payment routes to call ABAP functions
  - Update GET /api/payment/list to call Z_PAYMENT_GET_LIST
  - Update POST /api/payment/process to call Z_PAYMENT_PROCESS
  - Remove mock data
  - Handle validation errors and return HTTP 400 with message
  - Test payment APIs with real SAP data
  - Test Angular payment list and form work with real data
  - _Requirements: 5.1, 5.3, 5.6, 5.7, 10.2, 10.3_

- [ ] 52. Create ABAP delivery function modules and database tables
  - Create function group ZCUSTPRTL_DELIVERY in transaction SE80
  - Create table ZDELIVERIES with fields: delivery_number (C 10 key), sales_order_reference (C 10), customer_id (C 10), delivery_date (D), status (C 20), tracking_number (C 30)
  - Create table ZDELIVERY_ITEMS with fields: delivery_number (C 10 key), item_number (N 6 key), product_code (C 18), description (C 100), quantity (P 13 decimals 3), shipping_info (C 100)
  - Insert sample delivery data
  - Implement Z_DELIVERY_GET_LIST with parameter IV_CUSTOMER_ID (C 10), table ET_DELIVERIES
  - Implement Z_DELIVERY_GET_DETAILS with parameter IV_DELIVERY_ID (C 10), table ET_LINE_ITEMS
  - Check SY-SUBRC and raise exceptions
  - Test function modules in SE37
  - Update middleware delivery routes to call ABAP functions
  - Test Angular delivery components with real data
  - _Requirements: 7.1, 7.2, 7.3, 15.1, 15.2, 15.4_

- [ ] 53. Create ABAP customer profile function modules and database tables
  - Create function group ZCUSTPRTL_CUSTOMER in transaction SE80
  - Create table ZCUSTOMERS with fields: customer_id (C 10 key), name (C 100), address (C 200), city (C 50), postal_code (C 10), country (C 3), email (C 100), phone (C 20), payment_terms (C 20), credit_limit (P 15 decimals 2)
  - Insert sample customer data for customer_id '1000' and '1001'
  - Implement Z_CUSTOMER_GET_PROFILE with parameter IV_CUSTOMER_ID (C 10), exporting structure ES_CUSTOMER
  - Implement Z_CUSTOMER_UPDATE_PROFILE with parameter IV_CUSTOMER_ID (C 10), changing structure CS_CUSTOMER
  - In UPDATE function, only update email and phone fields
  - Check SY-SUBRC after UPDATE
  - Test function modules in SE37
  - Update middleware profile routes to call ABAP functions
  - Test Angular profile components with real data
  - _Requirements: 8.1, 8.2, 8.4, 15.1, 15.2, 15.4_

- [ ] 54. Create ABAP inquiry and sales order function modules and database tables
  - Create function group ZCUSTPRTL_INQUIRY in transaction SE80
  - Create table ZINQUIRIES with fields: inquiry_number (C 10 key), customer_id (C 10), product_code (C 18), quantity (P 13 decimals 3), delivery_date (D), description (C 500), status (C 20), created_at (TIMESTAMP)
  - Create table ZSALES_ORDERS with fields: order_number (C 10 key), customer_id (C 10), order_date (D), delivery_date (D), total_amount (P 15 decimals 2), status (C 20)
  - Create table ZSALESORDER_ITEMS with fields: order_number (C 10 key), item_number (N 6 key), product_code (C 18), description (C 100), quantity (P 13 decimals 3), unit_price (P 15 decimals 2), total_price (P 15 decimals 2)
  - Insert sample data
  - Implement Z_INQUIRY_CREATE with parameters IV_CUSTOMER_ID, IV_PRODUCT_CODE, IV_QUANTITY, IV_DELIVERY_DATE, IV_DESCRIPTION, exporting EV_INQUIRY_NUMBER
  - Generate inquiry number using timestamp or number range
  - Implement Z_SALESORDER_GET_LIST with parameter IV_CUSTOMER_ID, table ET_SALES_ORDERS
  - Implement Z_SALESORDER_GET_DETAILS with parameter IV_ORDER_ID, table ET_LINE_ITEMS
  - Test function modules in SE37
  - Update middleware inquiry routes to call ABAP functions
  - Test Angular inquiry components with real data
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 15.1, 15.2, 15.4_

- [ ] 55. Create ABAP credit/debit function modules and database tables
  - Create function group ZCUSTPRTL_CREDITDEBIT in transaction SE80
  - Create table ZCREDITDEBIT with fields: document_number (C 10 key), document_type (C 10), customer_id (C 10), invoice_reference (C 10), amount (P 15 decimals 2), reason_code (C 20), creation_date (D), status (C 20)
  - Create table ZCREDITDEBIT_ITEMS with fields: document_number (C 10 key), item_number (N 6 key), product_code (C 18), description (C 100), quantity (P 13 decimals 3), amount (P 15 decimals 2)
  - Insert sample credit and debit note data
  - Implement Z_CREDITDEBIT_GET_LIST with parameters IV_CUSTOMER_ID (C 10), IV_DOC_TYPE (C 10), table ET_DOCUMENTS
  - Filter by document_type in SELECT
  - Implement Z_CREDITDEBIT_GET_DETAILS with parameter IV_DOCUMENT_ID (C 10), table ET_LINE_ITEMS
  - Test function modules in SE37
  - Update middleware creditdebit routes to call ABAP functions
  - Test Angular credit/debit components with real data
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 15.1, 15.2, 15.4_

## Phase 15: Smart Forms and PDF Generation

- [ ] 56. Create Smart Form template for invoices
  - Create Smart Form ZSF_INVOICE in transaction SMARTFORMS
  - Design form layout: header window with company logo and invoice details
  - Add main window with table for line items (columns: item #, product code, description, quantity, unit price, total)
  - Add footer window with subtotal, tax, total amount
  - Define form interface with WA_INVOICE structure and IT_LINE_ITEMS table
  - Test form generation with sample data in SMARTFORMS transaction
  - _Requirements: 4.4, 4.5_

- [ ] 57. Implement ABAP Smart Form generation function
  - Create Z_INVOICE_CREATE_FORM in function group ZCUSTPRTL_INVOICE
  - Add importing parameter IV_INVOICE_ID (C 10), exporting parameter EV_PDF_BLOB (XSTRING)
  - Fetch invoice data from ZINVOICES and ZINVOICE_ITEMS
  - Call SSF_FUNCTION_MODULE_NAME to get generated function module name for ZSF_INVOICE
  - Check SY-SUBRC: if not 0, raise exception "Smart Form not found"
  - Call generated Smart Form function module with invoice data via WA_INVOICE parameter
  - Set output options for PDF generation
  - Convert OTF output to PDF using CONVERT_OTF_TO_PDF
  - Return PDF as XSTRING in EV_PDF_BLOB
  - Test function module in SE37
  - _Requirements: 4.4, 4.5, 4.6, 15.3, 15.4_

- [ ] 58. Implement PDF generation endpoint in middleware
  - Add GET /api/invoice/:id/form route in invoice.routes.js
  - Call Z_INVOICE_CREATE_FORM with invoice ID
  - Convert XSTRING PDF blob to Buffer
  - Set response headers: Content-Type: application/pdf, Content-Disposition: inline
  - Send PDF buffer in response
  - Handle errors: return HTTP 500 with message "Failed to generate form. Smart Form template may not exist."
  - Test endpoint with Postman (should download PDF)
  - _Requirements: 4.5, 4.6, 4.7, 12.1_

- [ ] 59. Implement PDF viewing in Angular
  - Update InvoiceService.generateInvoiceForm(invoiceId) to call real API endpoint
  - Configure HttpClient to receive blob response type: { responseType: 'blob' }
  - In DashboardComponent and InvoiceListComponent, call generateInvoiceForm() when user clicks "View Form"
  - Create blob URL using window.URL.createObjectURL(blob)
  - Open PDF in new browser tab using window.open(url, '_blank')
  - Handle error state and display error message if PDF generation fails
  - Test PDF generation end-to-end: click button → PDF opens in new tab
  - _Requirements: 2.4, 4.7, 12.3, 12.4_

- [ ] 60. Create Smart Form template for delivery documents
  - Create Smart Form ZSF_DELIVERY in transaction SMARTFORMS
  - Design form layout similar to invoice form
  - Add delivery header (delivery number, sales order, date, tracking number)
  - Add table for line items
  - Define form interface with WA_DELIVERY and IT_LINE_ITEMS
  - Implement Z_DELIVERY_CREATE_FORM similar to Z_INVOICE_CREATE_FORM
  - Add GET /api/delivery/:id/form endpoint in middleware
  - Update Angular DeliveryDetailComponent to call generateDeliveryForm()
  - Test delivery PDF generation
  - _Requirements: 7.5_

## Phase 16: Exception Classes and Final Integration

- [ ] 61. Create ABAP exception classes
  - Create exception class ZCX_INVOICE_ERROR in transaction SE24 inheriting from CX_STATIC_CHECK
  - Define text IDs: INVOICE_NOT_FOUND, DATABASE_ERROR, SMARTFORM_NOT_FOUND, FORM_GENERATION_ERROR, PDF_CONVERSION_ERROR
  - Create exception class ZCX_PAYMENT_ERROR with text IDs: PAYMENT_FAILED, INVALID_AMOUNT, BALANCE_EXCEEDED
  - Create exception class ZCX_NO_AUTHORIZATION with text ID: UNAUTHORIZED_ACCESS
  - Create exception class ZCX_DB_ERROR for database errors
  - Update all ABAP function modules to use these exception classes in RAISING clause
  - Update TRY-CATCH blocks to catch and raise appropriate exceptions
  - _Requirements: 12.1, 15.3, 15.4_

- [ ] 62. Optimize RFC connection pool and error handling
  - Review RFC connection pool configuration: ensure 5 connections maintained
  - Add connection timeout of 30 seconds in connectionParameters
  - Implement retry logic for transient RFC failures (max 2 retries with exponential backoff)
  - Ensure all RFC calls use try-finally pattern to release connections
  - Add comprehensive error logging: timestamp, username, endpoint, error message
  - Verify no passwords or tokens are logged
  - Test concurrent request handling: make 10 simultaneous API calls
  - Verify RFC pool queues requests when all 5 connections busy
  - _Requirements: 10.1, 10.4, 10.5, 10.6, 11.5, 15.4_

- [ ] 63. Performance testing and optimization
  - Test dashboard loads in < 3 seconds
  - Test invoice list (50 records) loads in < 2 seconds
  - Test invoice detail loads in < 1 second
  - Test PDF generation completes in < 5 seconds
  - Test payment processing completes in < 3 seconds
  - Optimize ABAP SELECT statements: add indexes to database tables if needed
  - Review and optimize Angular change detection if performance issues
  - Add console logging for API response times in middleware
  - _Requirements: 3.8, 10.6, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 64. Final end-to-end testing
  - Test complete user journey: login → dashboard → invoice list → invoice detail → PDF generation → payment → profile → delivery → inquiry → logout
  - Test with Admin role: verify "Request Credit/Debit" button shows
  - Test with User role: verify "Request Credit/Debit" button hidden
  - Test JWT token expiry: wait 8 hours or manually expire token, verify redirect to login
  - Test pagination with > 50 invoices
  - Test search filters correctly
  - Test all error scenarios display appropriate messages
  - Test all validation prevents invalid submissions
  - Test concurrent users: open portal in multiple browsers
  - Document any bugs found and fix them
  - _Requirements: All requirements_

- [ ]* 64.1 Create documentation
  - Document API endpoints in README.md with request/response examples
  - Document environment setup: Node.js installation, Angular CLI, SAP connection
  - Document database table creation steps
  - Document Smart Form creation steps
  - Document sample credentials for testing
  - Create user guide with screenshots of each feature
  - Create troubleshooting guide for common issues
  - _Requirements: All requirements_
