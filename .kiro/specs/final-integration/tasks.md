# Implementation Plan

This implementation plan covers the complete final integration of the Customer Portal. Tasks are organized by priority and dependency, starting with navigation refactoring, then dashboard implementation, Finance Sheet integration, bug fixes, and API endpoint implementation.

## Phase 1: Navigation Refactoring (Immediate Priority)

- [x] 1. Update sidebar navigation


  - Open src/app/shared/components/sidebar/sidebar.component.ts
  - Remove "Payment List" and "Payment Form" entries from navItems array
  - Rename "Inquiry Form" to "Inquiries"
  - Add new entry: { label: 'Finance Sheet', route: '/finance', icon: 'account_balance' }
  - Reorder navItems to: Dashboard, Finance Sheet, Invoice, Delivery, Inquiries, Sales Orders, Credit/Debit, Profile
  - Test sidebar renders with updated navigation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create Finance module and component


  - Create directory src/app/finance
  - Create finance.module.ts with FinanceModule class
  - Create finance-routing.module.ts with route configuration
  - Create finance-sheet.component.ts, .html, .css files
  - Import MatTabsModule, MatCardModule in FinanceModule
  - Define default route '' pointing to FinanceSheetComponent
  - _Requirements: 2.1, 2.2_

- [x] 3. Add Finance route to app routing


  - Open src/app/app.routes.ts
  - Add lazy-loaded route: { path: 'finance', loadChildren: () => import('./finance/finance.module').then(m => m.FinanceModule) }
  - Apply authGuard to finance route
  - Comment out payment route with note "// Payment features disabled"
  - Test /finance route loads correctly
  - _Requirements: 1.5, 2.3, 2.4_

- [x] 4. Move Finance Sheet tabs from Dashboard to Finance component


  - Open src/app/dashboard/dashboard/dashboard.html
  - Copy entire `<div class="finance-sheet-section">` with mat-tab-group
  - Open src/app/finance/finance-sheet.component.html
  - Paste mat-tab-group into finance-sheet template
  - Wrap in container div with class "finance-sheet-container"
  - Add h1 heading "Finance Sheet"
  - Delete finance-sheet-section from dashboard.html
  - Test Finance Sheet page displays tabs correctly
  - _Requirements: 2.2, 2.5, 3.2_

- [x] 5. Verify Dashboard simplification

  - Open src/app/dashboard/dashboard/dashboard.html
  - Confirm Finance Sheet section is removed
  - Verify KPI cards section remains
  - Verify Quick Access section remains
  - Test dashboard renders correctly without tabs
  - _Requirements: 3.1, 3.2, 3.3_


## Phase 2: Dashboard KPI Implementation

- [x] 6. Create dashboard stats API endpoint


  - Open or create middleware/routes/dashboard.routes.js
  - Import required modules: express, authMiddleware, soapService
  - Create Express router
  - Define GET /dashboard/stats endpoint with authMiddleware
  - Extract customerId from req.user
  - _Requirements: 4.8, 10.1, 10.7_

- [x] 7. Implement parallel SAP service calls for KPIs

  - In GET /dashboard/stats handler, use Promise.all to call 5 services in parallel
  - Call ZRFC_CUST_INQUIRY_863 with IV_CUSTOMER_ID parameter
  - Call ZRFC_SALEORDERS_863 with IV_CUSTOMER_ID parameter
  - Call ZRFC_DELIVERY_LIST_863 with IV_CUSTOMER_ID parameter
  - Call ZRFC_INVOICE_DETAILS_863 with IV_CUSTOMER_ID parameter
  - Call ZRFC_OVERALLSALES_863 with IV_CUSTOMER_ID parameter
  - Wrap in try-catch block for error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 8. Calculate KPI counts from SAP responses

  - Calculate totalInquiries as inquiries.length
  - Calculate totalSalesOrders as salesOrders.length
  - Calculate totalDeliveries as deliveries.length
  - For totalInvoices: create Set of unique DOCUMENT_NUMBER values, return size
  - Calculate totalOverallSales as overallSales.length
  - Return HTTP 200 with JSON: { success: true, stats: { totalInquiries, totalSalesOrders, totalDeliveries, totalInvoices, totalOverallSales } }
  - In catch block, return HTTP 500 with error message "Failed to load dashboard statistics"
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.8_

- [x] 9. Register dashboard routes in server

  - Open middleware/server.js
  - Import dashboard routes: const dashboardRoutes = require('./routes/dashboard.routes')
  - Register routes: app.use('/api', dashboardRoutes)
  - Test server starts without errors
  - _Requirements: 10.1_

- [x] 10. Update Dashboard component to call stats API


  - Open src/app/dashboard/dashboard/dashboard.ts
  - Import ChangeDetectorRef from @angular/core
  - Inject ChangeDetectorRef in constructor
  - Create loadDashboardStats() method
  - Call this.apiService.get<any>('/dashboard/stats')
  - In subscribe next callback: assign response.stats to this.dashboardSummary
  - Set isLoading = false and call this.cdr.detectChanges()
  - In error callback: set errorMessage and call this.cdr.detectChanges()
  - Call loadDashboardStats() in ngOnInit()
  - _Requirements: 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Test dashboard KPI integration end-to-end

  - Start middleware server
  - Start Angular dev server
  - Login to portal
  - Navigate to dashboard
  - Verify 5 KPI cards display with numeric values
  - Verify loading spinner shows during data fetch
  - Verify data appears immediately without double-click
  - Test error handling by stopping middleware
  - _Requirements: 3.1, 3.4, 3.5, 7.5, 11.1, 11.2_

## Phase 3: Fix Quick Access Layout

- [x] 12. Update Quick Access CSS for horizontal layout



  - Open src/app/dashboard/dashboard/dashboard.css
  - Find .quick-links-container selector
  - Add CSS: display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap;
  - Find or create .quick-link-card selector
  - Add CSS: flex: 0 1 calc(25% - 16px); min-width: 200px; cursor: pointer;
  - Add hover effect: transform: translateY(-4px); box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  - Add media query for mobile: @media (max-width: 768px) { .quick-link-card { flex: 0 1 calc(50% - 16px); } }
  - Test Quick Access cards display horizontally on desktop
  - Test cards wrap on mobile/small screens
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

## Phase 4: Convert Inquiry Form to List

- [x] 13. Create Inquiry data model




  - Open or create src/app/inquiry/inquiry.ts
  - Define Inquiry interface with properties: documentNumber (string), creationDate (string), createdBy (string), materialDescription (string), netValue (number), currency (string)
  - Export Inquiry interface
  - _Requirements: 5.2, 9.3_

- [ ] 14. Create Inquiry List component files
  - Create src/app/inquiry/inquiry-list.component.ts
  - Create src/app/inquiry/inquiry-list.component.html
  - Create src/app/inquiry/inquiry-list.component.css
  - Import required Angular Material modules
  - Define component class with properties: inquiries (Inquiry[]), displayedColumns (string[]), isLoading (boolean), errorMessage (string)
  - Inject InquiryService and ChangeDetectorRef in constructor
  - _Requirements: 5.1, 5.2_

- [ ] 15. Implement Inquiry List template
  - In inquiry-list.component.html, create mat-card container
  - Add mat-card-header with title "Inquiries"
  - Add loading spinner with *ngIf="isLoading"
  - Add error message display with *ngIf="errorMessage && !isLoading"
  - Add retry button that calls loadInquiries()
  - Create mat-table with [dataSource]="inquiries"
  - Define columns: documentNumber, creationDate, materialDescription, netValue
  - Use date pipe for creationDate: {{ inquiry.creationDate | date:'MM/dd/yyyy' }}
  - Use currency pipe for netValue: {{ inquiry.netValue | currency:inquiry.currency }}
  - Add mat-header-row and mat-row definitions
  - _Requirements: 5.2, 5.6, 11.1, 11.2, 11.3_

- [ ] 16. Implement loadInquiries method
  - In InquiryListComponent, create loadInquiries() method
  - Set isLoading = true and errorMessage = ''
  - Call this.inquiryService.getInquiries()
  - In subscribe next: assign data to this.inquiries, set isLoading = false, call this.cdr.detectChanges()
  - In subscribe error: set errorMessage = 'Failed to load inquiries', set isLoading = false, call this.cdr.detectChanges()
  - Call loadInquiries() in ngOnInit()
  - _Requirements: 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 17. Update Inquiry Service with getInquiries method
  - Open src/app/inquiry/inquiry.service.ts (or create if doesn't exist)
  - Add getInquiries() method returning Observable<Inquiry[]>
  - Implement: return this.apiService.get<any>('/inquiries').pipe(map(response => response.inquiries))
  - _Requirements: 5.3_

- [ ] 18. Update Inquiry module routing
  - Open src/app/inquiry/inquiry-routing.module.ts
  - Change default route '' to point to InquiryListComponent
  - Keep sales-orders routes unchanged
  - Update inquiry.module.ts to declare InquiryListComponent
  - Test /inquiry route loads InquiryListComponent
  - _Requirements: 5.1_


## Phase 5: Implement Inquiry API Endpoint

- [ ] 19. Create inquiry API endpoint
  - Open or create middleware/routes/inquiry.routes.js
  - Import express, authMiddleware, soapService
  - Create Express router
  - Define GET /inquiries endpoint with authMiddleware
  - Extract customerId from req.user
  - _Requirements: 10.2, 10.7_

- [ ] 20. Implement inquiry endpoint handler with data mapping
  - In GET /inquiries handler, call soapService.call('ZRFC_CUST_INQUIRY_863', { IV_CUSTOMER_ID: customerId })
  - Map SAP response to camelCase: documentNumber (DOCUMENT_NUMBER), creationDate (CREATION_DATE), createdBy (CREATED_BY), materialDescription (MATERIAL_DESC), netValue (NET_VALUE), currency (CURRENCY)
  - Parse netValue as float using parseFloat()
  - Return HTTP 200 with JSON: { success: true, inquiries: mappedArray }
  - Wrap in try-catch, return HTTP 500 on error with message "Failed to load inquiries"
  - _Requirements: 5.3, 5.4, 9.1, 9.2, 9.3, 9.4, 10.2, 10.8_

- [ ] 21. Register inquiry routes in server
  - Open middleware/server.js
  - Import inquiry routes if not already imported
  - Register routes: app.use('/api', inquiryRoutes)
  - Test server starts without errors
  - _Requirements: 10.2_

- [ ] 22. Test inquiry integration end-to-end
  - Start middleware and Angular servers
  - Navigate to /inquiry route
  - Verify table displays with 4 columns
  - Verify data loads from API
  - Verify currency formatting works
  - Verify date formatting works
  - Verify loading spinner shows
  - Verify error handling works
  - Verify data appears immediately (no double-click)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.5, 11.1, 11.2, 11.3_

## Phase 6: Implement Finance Sheet Tab Components

- [ ] 23. Create CreditDebitListComponent
  - Create src/app/invoice/credit-debit-list.component.ts, .html, .css
  - Define component with properties: memos (Memo[]), isLoading, errorMessage
  - Inject InvoiceService and ChangeDetectorRef
  - Create loadMemos() method calling invoiceService.getMemos()
  - Apply change detection fix: call this.cdr.detectChanges() after data assignment
  - Create mat-table template with columns: documentNumber, documentType, referenceInvoice, amount, reason, creationDate
  - Add loading spinner and error handling
  - _Requirements: 6.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 24. Create AgingComponent
  - Create src/app/invoice/aging.component.ts, .html, .css
  - Define component with properties: agingBuckets (AgingBucket[]), isLoading, errorMessage
  - Inject InvoiceService and ChangeDetectorRef
  - Create loadAgingSummary() method calling invoiceService.getAgingSummary()
  - Apply change detection fix
  - Create mat-table template with columns: agingBucket, amount, invoiceCount
  - Add loading spinner and error handling
  - _Requirements: 6.3, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 25. Create OverallSalesComponent
  - Create src/app/invoice/overall-sales.component.ts, .html, .css
  - Define component with properties: salesRecords (OverallSales[]), isLoading, errorMessage
  - Inject InvoiceService and ChangeDetectorRef
  - Create loadOverallSales() method calling invoiceService.getOverallSales()
  - Apply change detection fix
  - Create mat-table template with columns: documentNumber, salesDate, materialDescription, quantity, netValue
  - Add loading spinner and error handling
  - _Requirements: 6.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 26. Update InvoiceService with Finance Sheet methods
  - Open src/app/invoice/invoice.service.ts
  - Add getMemos() method: return this.apiService.get<any>('/memos').pipe(map(r => r.memos))
  - Add getAgingSummary() method: return this.apiService.get<any>('/aging/summary').pipe(map(r => r.agingSummary))
  - Add getOverallSales() method: return this.apiService.get<any>('/sales/overall').pipe(map(r => r.overallSales))
  - _Requirements: 6.2, 6.3, 6.4_

- [ ] 27. Update Finance Sheet component to use new components
  - Open src/app/finance/finance-sheet.component.html
  - Verify Invoice tab uses <app-invoice-list>
  - Update Credit/Debit tab to use <app-credit-debit-list>
  - Update Aging tab to use <app-aging>
  - Update Overall Sales tab to use <app-overall-sales>
  - Import and declare new components in FinanceModule
  - Test all tabs load and display data correctly
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

## Phase 7: Implement Finance Sheet API Endpoints

- [ ] 28. Create financial routes file
  - Create middleware/routes/financial.routes.js
  - Import express, authMiddleware, soapService
  - Create Express router
  - _Requirements: 10.3, 10.4, 10.5, 10.6_

- [ ] 29. Implement GET /api/memos endpoint
  - Define GET /memos with authMiddleware
  - Extract customerId from req.user
  - Call soapService.call('ZRFC_MEMOS_863', { IV_CUSTOMER_ID: customerId })
  - Map to camelCase: documentNumber, documentType, referenceInvoice, amount, currency, reason, creationDate
  - Parse amount as float
  - Return HTTP 200 with { success: true, memos: mappedArray }
  - Handle errors with HTTP 500
  - _Requirements: 6.2, 9.1, 9.2, 9.3, 9.4, 10.4_

- [ ] 30. Implement GET /api/aging/summary endpoint
  - Define GET /aging/summary with authMiddleware
  - Extract customerId from req.user
  - Call soapService.call('ZRFC_AGING_863', { IV_CUSTOMER_ID: customerId })
  - Map to camelCase: agingBucket, amount, currency, invoiceCount
  - Parse amount as float and invoiceCount as int
  - Return HTTP 200 with { success: true, agingSummary: mappedArray }
  - Handle errors with HTTP 500
  - _Requirements: 6.3, 9.1, 9.2, 9.3, 9.4, 10.5_

- [ ] 31. Implement GET /api/sales/overall endpoint
  - Define GET /sales/overall with authMiddleware
  - Extract customerId from req.user
  - Call soapService.call('ZRFC_OVERALLSALES_863', { IV_CUSTOMER_ID: customerId })
  - Map to camelCase: documentNumber, salesDate, materialDescription, quantity, netValue, currency
  - Parse quantity and netValue as float
  - Return HTTP 200 with { success: true, overallSales: mappedArray }
  - Handle errors with HTTP 500
  - _Requirements: 6.4, 9.1, 9.2, 9.3, 9.4, 10.6_

- [ ] 32. Implement GET /api/invoices endpoint
  - Define GET /invoices with authMiddleware
  - Extract customerId from req.user
  - Call soapService.call('ZRFC_INVOICE_DETAILS_863', { IV_CUSTOMER_ID: customerId })
  - Group line items by DOCUMENT_NUMBER
  - For each unique invoice, create object with: documentNumber, customerName, invoiceDate, dueDate, netValue (sum of line items), currency, status
  - Return HTTP 200 with { success: true, invoices: mappedArray }
  - Handle errors with HTTP 500
  - _Requirements: 6.1, 9.1, 9.2, 9.3, 9.4, 10.3_

- [ ] 33. Register financial routes in server
  - Open middleware/server.js
  - Import financial routes: const financialRoutes = require('./routes/financial.routes')
  - Register routes: app.use('/api', financialRoutes)
  - Test server starts without errors
  - _Requirements: 10.3, 10.4, 10.5, 10.6_


## Phase 8: Apply Change Detection Fix to Existing Components

- [ ] 34. Fix InvoiceListComponent change detection
  - Open src/app/invoice/invoice-list/invoice-list.ts
  - Import ChangeDetectorRef from @angular/core
  - Inject ChangeDetectorRef in constructor
  - In loadInvoices() subscribe next callback, add this.cdr.detectChanges() after data assignment
  - In error callback, add this.cdr.detectChanges()
  - Test invoice list displays data immediately
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 12.1_

- [ ] 35. Fix DeliveryListComponent change detection
  - Open src/app/delivery/delivery-list/delivery-list.ts
  - Import and inject ChangeDetectorRef
  - Add this.cdr.detectChanges() in loadDeliveries() subscribe callbacks
  - Test delivery list displays data immediately
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 12.2_

- [ ] 36. Fix SalesOrderListComponent change detection
  - Open src/app/inquiry/sales-order-list/sales-order-list.component.ts
  - Import and inject ChangeDetectorRef
  - Add this.cdr.detectChanges() in loadSalesOrders() subscribe callbacks
  - Test sales order list displays data immediately
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 12.3_

- [ ] 37. Fix ProfileViewComponent change detection
  - Open src/app/profile/profile-view/profile-view.ts
  - Import and inject ChangeDetectorRef
  - Add this.cdr.detectChanges() in loadProfile() subscribe callbacks
  - Test profile displays data immediately
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 12.4_

## Phase 9: Integration Testing and Validation

- [ ] 38. Test complete navigation flow
  - Login to portal
  - Verify sidebar shows: Dashboard, Finance Sheet, Invoice, Delivery, Inquiries, Sales Orders, Credit/Debit, Profile
  - Verify Payment links are removed
  - Click each navigation link and verify correct page loads
  - Verify Finance Sheet link navigates to /finance
  - Verify Inquiries link navigates to /inquiry and shows list (not form)
  - Test browser back/forward buttons work correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 39. Test Dashboard functionality
  - Navigate to dashboard
  - Verify 5 KPI cards display with numeric values
  - Verify KPI values are accurate (match data from SAP)
  - Verify Quick Access section displays 4 cards horizontally
  - Verify Quick Access cards are clickable and navigate correctly
  - Verify loading spinner shows during initial load
  - Verify data appears immediately without double-click
  - Test error handling by stopping middleware
  - Verify retry button works
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.5, 8.1, 8.2, 8.3, 8.4_

- [ ] 40. Test Finance Sheet functionality
  - Navigate to /finance
  - Verify page title shows "Finance Sheet"
  - Verify 4 tabs are present: Invoice, Credit/Debit, Aging, Overall Sales
  - Click Invoice tab, verify invoice list displays
  - Click Credit/Debit tab, verify memos display
  - Click Aging tab, verify aging buckets display
  - Click Overall Sales tab, verify sales records display
  - Verify each tab loads data correctly
  - Verify loading spinners show during data fetch
  - Verify data appears immediately in each tab
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 41. Test Inquiry List functionality
  - Navigate to /inquiry
  - Verify page shows table (not form)
  - Verify table has columns: Document Number, Creation Date, Material Description, Net Value
  - Verify data loads from API
  - Verify currency formatting displays correctly
  - Verify date formatting displays correctly (MM/dd/yyyy)
  - Verify loading spinner shows
  - Verify error handling works
  - Verify data appears immediately
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.5_

- [ ] 42. Test existing features still work
  - Test Invoice detail page loads correctly
  - Test Delivery detail page loads correctly
  - Test Sales Order detail page loads correctly
  - Test Profile edit functionality works
  - Test authentication (login/logout) works
  - Verify all data displays immediately (no double-click needed)
  - _Requirements: 7.5, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 43. Test API endpoints with Postman or curl
  - Test GET /api/dashboard/stats returns 5 KPI values
  - Test GET /api/inquiries returns inquiry list with camelCase properties
  - Test GET /api/invoices returns invoice list with camelCase properties
  - Test GET /api/memos returns memo list with camelCase properties
  - Test GET /api/aging/summary returns aging data with camelCase properties
  - Test GET /api/sales/overall returns sales data with camelCase properties
  - Test all endpoints require JWT authentication (return 401 without token)
  - Test all endpoints return user-friendly error messages on failure
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [ ] 44. Verify data consistency across all components
  - Check that all TypeScript interfaces use camelCase property names
  - Check that all Angular templates use camelCase property names
  - Check that all middleware responses use camelCase property names
  - Verify Master Data Contract is followed consistently
  - Test that data displays correctly in all tables
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## Phase 10: Error Handling and Edge Cases

- [ ] 45. Test error handling in all components
  - For each component with API calls, stop middleware and verify error message displays
  - Verify retry buttons work in all components
  - Verify loading spinners hide when errors occur
  - Verify error messages are user-friendly (no technical details exposed)
  - Verify console logs contain detailed error information for debugging
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 46. Test authentication and authorization
  - Test accessing protected routes without login redirects to login page
  - Test expired JWT token redirects to login
  - Test API calls without token return 401
  - Test logout clears token and redirects to login
  - Test login with valid credentials works
  - Test login with invalid credentials shows error
  - _Requirements: 10.7, 10.8, 12.5_

- [ ]* 47. Performance testing
  - Measure dashboard load time (should be < 3 seconds)
  - Measure Finance Sheet tab switching time
  - Measure API response times for all endpoints
  - Test with large datasets (100+ records)
  - Verify no memory leaks during navigation
  - _Requirements: 3.4_

- [ ]* 48. Cross-browser testing
  - Test in Chrome, Firefox, Safari, Edge
  - Verify layout displays correctly in all browsers
  - Verify all functionality works in all browsers
  - Test responsive design on mobile devices
  - _Requirements: 8.5_

## Phase 11: Documentation and Cleanup

- [ ]* 49. Document Master Data Contract
  - Create documentation file listing all SAP field to camelCase mappings
  - Document API endpoint request/response formats
  - Document TypeScript interfaces
  - Add comments to middleware mapping code
  - _Requirements: 9.5_

- [ ]* 50. Code cleanup and optimization
  - Remove unused imports from all files
  - Remove commented-out code
  - Ensure consistent code formatting
  - Run linter and fix any issues
  - Verify no TypeScript compilation errors
  - Verify no console warnings in browser
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ]* 51. Update project documentation
  - Update README with new navigation structure
  - Document Finance Sheet page
  - Document Inquiry List functionality
  - Document API endpoints
  - Document change detection fix pattern
  - Add troubleshooting guide
  - _Requirements: 9.5_
