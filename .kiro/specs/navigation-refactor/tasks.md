# Implementation Plan

This implementation plan breaks down the navigation refactoring into discrete, manageable coding tasks. Each task builds incrementally on previous tasks to ensure a smooth refactoring process.

## Phase 1: Update Sidebar Navigation

- [ ] 1. Refactor sidebar navigation component
  - Update navItems array in sidebar.component.ts to remove "Payment List" and "Payment Form" entries
  - Rename "Inquiry Form" to "Inquiries" in navItems array
  - Add new "Finance Sheet" navigation item with route "/finance" and icon "account_balance"
  - Reorder navItems array to match requirement: Dashboard, Finance Sheet, Invoice, Delivery, Inquiries, Sales Orders, Credit/Debit, Profile
  - Test that sidebar renders with updated navigation items
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

## Phase 2: Create Finance Module and Component

- [ ] 2. Generate Finance module and component
  - Create new directory src/app/finance
  - Generate FinanceModule using Angular CLI or manually create finance.module.ts
  - Generate FinanceSheetComponent with template, styles, and TypeScript files
  - Import required Angular Material modules (MatTabsModule, MatCardModule) in FinanceModule
  - Export FinanceSheetComponent from FinanceModule
  - _Requirements: 5.1, 5.2_

- [ ] 3. Create Finance routing configuration
  - Create finance-routing.module.ts with route configuration
  - Define default route '' that loads FinanceSheetComponent
  - Import FinanceRoutingModule in FinanceModule
  - _Requirements: 5.4_

- [ ] 4. Add Finance route to app routing
  - Open src/app/app.routes.ts
  - Add new lazy-loaded route for '/finance' that loads FinanceModule
  - Apply authGuard to the finance route
  - Comment out payment route with note "// Payment features disabled but preserved for future use"
  - Test that navigating to /finance loads the Finance module
  - _Requirements: 1.4, 5.4, 5.5, 10.1, 10.2, 10.3, 10.5, 12.4_

## Phase 3: Move Finance Sheet Content from Dashboard

- [ ] 5. Move tab group to Finance Sheet component
  - Open src/app/dashboard/dashboard/dashboard.html
  - Copy the entire `<div class="finance-sheet-section">` containing mat-tab-group element
  - Open src/app/finance/finance-sheet.component.html
  - Paste the mat-tab-group into finance-sheet.component.html
  - Wrap in appropriate container div with class "finance-sheet-container"
  - Add h1 heading "Finance Sheet" above the tab group
  - Ensure all child components (app-invoice-list, app-credit-debit-list, app-aging, app-overall-sales) are referenced correctly
  - _Requirements: 5.3, 6.2, 6.3_

- [ ] 6. Remove Finance Sheet from Dashboard
  - Open src/app/dashboard/dashboard/dashboard.html
  - Delete the entire `<div class="finance-sheet-section">` containing mat-tab-group
  - Verify KPI cards section remains intact
  - Verify Quick Access section remains intact
  - Update dashboard.component.css if needed to adjust spacing after removal
  - _Requirements: 6.1, 6.2, 9.1, 9.2, 9.3_

- [ ] 7. Test Finance Sheet page functionality
  - Navigate to /finance route and verify Finance Sheet page loads
  - Verify all four tabs (Invoice, Credit/Debit, Aging, Overall Sales) display correctly
  - Verify tab switching works properly
  - Verify tab content displays the same data as before
  - Verify Finance Sheet link in sidebar highlights when on /finance route
  - _Requirements: 3.4, 5.3, 6.3, 6.4, 11.1, 11.4_


## Phase 4: Convert Inquiry Form to Inquiry List

- [ ] 8. Create Inquiry data model
  - Open or create src/app/inquiry/inquiry.ts
  - Add Inquiry interface with properties: documentNumber (string), creationDate (string), createdBy (string), materialDescription (string), netValue (number), currency (string)
  - Export Inquiry interface
  - _Requirements: 7.4_

- [ ] 9. Create Inquiry List component
  - Create new file src/app/inquiry/inquiry-list.component.ts (or rename inquiry-form.component.ts)
  - Create new file src/app/inquiry/inquiry-list.component.html
  - Create new file src/app/inquiry/inquiry-list.component.css
  - Implement component class with properties: inquiries array, displayedColumns array, isLoading boolean, errorMessage string
  - Define displayedColumns as ['documentNumber', 'creationDate', 'createdBy', 'materialDescription', 'netValue', 'currency']
  - Implement ngOnInit() to call loadInquiries() method
  - _Requirements: 7.1, 7.2_

- [ ] 10. Implement Inquiry List template
  - Create mat-card container with header "Inquiries" and subtitle "View inquiry records from SAP"
  - Add loading spinner with *ngIf="isLoading" condition
  - Add error message display with *ngIf="errorMessage && !isLoading" condition
  - Add retry button in error section that calls loadInquiries()
  - Create mat-table with [dataSource]="inquiries" binding
  - Define table columns for documentNumber, creationDate, createdBy, materialDescription, netValue, currency
  - Use currency pipe for netValue column: {{ inquiry.netValue | currency:inquiry.currency }}
  - Use date pipe for creationDate column: {{ inquiry.creationDate | date:'MM/dd/yyyy' }}
  - Add mat-header-row and mat-row definitions
  - Add "No inquiries found" message with *ngIf="!isLoading && !errorMessage && inquiries.length === 0"
  - _Requirements: 7.2, 7.4, 7.6_

- [ ] 11. Update Inquiry Service with getInquiries method
  - Open src/app/inquiry/inquiry.service.ts (or create if doesn't exist)
  - Add getInquiries() method that returns Observable<Inquiry[]>
  - Implement method to call this.apiService.get<Inquiry[]>('/inquiries')
  - _Requirements: 7.3, 7.4_

- [ ] 12. Implement loadInquiries method in component
  - In InquiryListComponent, implement loadInquiries() method
  - Set isLoading = true and errorMessage = '' at start
  - Call inquiryService.getInquiries() and subscribe to result
  - In next callback: set inquiries array and isLoading = false
  - In error callback: set errorMessage = 'Failed to load inquiries. Please try again later.' and isLoading = false
  - Log error to console for debugging
  - _Requirements: 7.3, 7.5, 7.6_

- [ ] 13. Update Inquiry module routing
  - Open src/app/inquiry/inquiry-routing.module.ts
  - Update default route '' to point to InquiryListComponent instead of InquiryFormComponent
  - Keep sales-orders routes unchanged
  - Update inquiry.module.ts declarations to include InquiryListComponent
  - _Requirements: 7.1, 7.2_

- [ ]* 13.1 Add styling for Inquiry List component
  - Create CSS styles for inquiry-list-container, mat-card, mat-table
  - Add responsive table styling with horizontal scroll for small screens
  - Style loading spinner to be centered
  - Style error message with red color and appropriate padding
  - Add hover effect for table rows
  - _Requirements: 7.2_

## Phase 5: Implement Inquiry API Endpoint

- [ ] 14. Create inquiry API route in middleware
  - Open or create middleware/routes/inquiry.routes.js
  - Import required modules: express, authMiddleware, rfcCallService
  - Create Express router instance
  - Define GET /inquiries endpoint with authMiddleware
  - Export router
  - _Requirements: 8.1, 8.6_

- [ ] 15. Implement inquiry endpoint handler
  - In GET /inquiries handler, extract customerId from req.user (JWT token)
  - Call rfcCallService.callRfcFunction('ZFM_CUST_INQUIRY_RP_863', { IV_CUSTOMER_ID: customerId })
  - Wrap RFC call in try-catch block
  - Check result.SY_SUBRC value: if not 0, return HTTP 500 with error message
  - Map SAP response ET_INQUIRIES table to frontend format (documentNumber, creationDate, createdBy, materialDescription, netValue, currency)
  - Parse netValue as float using parseFloat()
  - Return HTTP 200 with JSON response containing success: true and inquiries array
  - In catch block, log error and return HTTP 500 with error message "Failed to retrieve inquiry data from SAP"
  - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [ ] 16. Register inquiry routes in server
  - Open middleware/server.js
  - Import inquiry routes: const inquiryRoutes = require('./routes/inquiry.routes')
  - Register routes: app.use('/api', inquiryRoutes)
  - Ensure inquiry routes are registered after auth middleware setup
  - _Requirements: 8.1_

- [ ] 17. Test inquiry API endpoint
  - Start middleware server
  - Use Postman or curl to test GET /api/inquiries with valid JWT token
  - Verify endpoint returns inquiry data in correct format
  - Test with invalid token to verify authentication works
  - Test error handling by simulating SAP connection failure
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_


## Phase 6: Integration and Testing

- [ ] 18. Connect Angular Inquiry List to API
  - Update ApiService base URL if needed to point to middleware
  - Verify InquiryService getInquiries() method calls correct endpoint
  - Test inquiry list page loads data from API
  - Verify loading spinner displays during API call
  - Verify error handling works when API returns error
  - Verify table displays data correctly with proper formatting
  - _Requirements: 7.3, 7.4, 7.5, 7.6, 11.3_

- [ ] 19. Verify Dashboard simplification
  - Navigate to /dashboard route
  - Verify Finance Sheet tabs are no longer present
  - Verify KPI cards display correctly in top section
  - Verify Quick Access section displays correctly at bottom
  - Verify dashboard loads within 3 seconds
  - Verify dashboard data loading still works correctly
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 20. Test complete navigation flow
  - Test all sidebar navigation links work correctly
  - Verify Finance Sheet link navigates to /finance
  - Verify Inquiries link navigates to /inquiry and shows list
  - Verify active route highlighting works for all links
  - Verify payment routes are not accessible (redirect to dashboard)
  - Test browser back/forward buttons work correctly
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 3.3, 3.4, 4.1, 4.2, 4.3_

- [ ] 21. Regression testing for existing features
  - Test Invoice module: verify list, detail, and PDF generation still work
  - Test Delivery module: verify list and detail pages still work
  - Test Sales Orders: verify list and detail pages still work
  - Test Credit/Debit: verify it works in Finance Sheet tabs
  - Test Profile module: verify view and edit still work
  - Test authentication: verify login and logout still work
  - Verify AuthGuard protects all routes correctly
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ]* 21.1 Perform comprehensive end-to-end testing
  - Test complete user workflow: login → dashboard → finance sheet → inquiries → other features
  - Test error scenarios: network failures, invalid tokens, SAP errors
  - Test loading states for all components
  - Test responsive design on different screen sizes
  - Verify no console errors appear during normal usage
  - Test lazy loading works correctly for all modules
  - _Requirements: All requirements_

## Phase 7: Code Cleanup and Documentation

- [ ] 22. Add code comments for disabled payment features
  - Add comment in app.routes.ts above commented payment route: "// Payment features disabled but preserved for future use"
  - Add comment in sidebar.component.ts noting removed payment navigation items
  - Verify PaymentModule, PaymentListComponent, PaymentFormComponent files are intact
  - Verify payment API endpoints in middleware are preserved
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 22.1 Update documentation
  - Update README or project documentation to reflect navigation changes
  - Document new Finance Sheet page location
  - Document Inquiry List functionality
  - Note that payment features are disabled but code is preserved
  - _Requirements: 12.5_

- [ ]* 22.2 Code review and optimization
  - Review all modified files for code quality
  - Remove any unused imports
  - Ensure consistent code formatting
  - Verify no TypeScript compilation errors
  - Run linter and fix any issues
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

