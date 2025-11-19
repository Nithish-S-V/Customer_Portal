# Requirements Document

## Introduction

This document defines the requirements for the final integration of the Customer Portal. The SAP backend is complete with 11 web services available. This integration connects the Angular frontend to live SAP services via Node.js middleware, implements all API endpoints, fixes UI bugs, and refactors navigation to match the final project vision.

## Glossary

- **Customer Portal System**: The complete Angular-based web application for customer self-service
- **Finance Sheet**: Dedicated page with tabs for Invoice, Credit/Debit, Aging, and Overall Sales
- **KPI Cards**: Dashboard summary cards showing counts for Inquiries, Sales Orders, Deliveries, Invoices, and Overall Sales
- **Master Data Contract**: Consistent camelCase property naming convention between middleware and Angular
- **SAP Web Services**: 11 SOAP-based services providing all portal data (ZRFC_CUST_INQUIRY_863, ZRFC_SALEORDERS_863, etc.)
- **Change Detection Bug**: Issue where data requires double-click to display due to Angular change detection not triggering
- **Quick Access Section**: Dashboard navigation cards for quick feature access

## Requirements

### Requirement 1: Refactor Sidebar Navigation

**User Story:** As a customer, I want a clean navigation menu that reflects available features, so that I can easily access portal functionality.

#### Acceptance Criteria

1. WHEN the sidebar renders, THE Customer Portal System SHALL NOT display "Payment List" or "Payment Form" navigation links
2. WHEN the sidebar renders, THE Customer Portal System SHALL display "Inquiries" instead of "Inquiry Form"
3. WHEN the sidebar renders, THE Customer Portal System SHALL display new top-level link "Finance Sheet" with icon "account_balance"
4. THE Customer Portal System SHALL display navigation links in order: Dashboard, Finance Sheet, Invoice, Delivery, Inquiries, Sales Orders, Credit/Debit, Profile
5. WHEN a user clicks Finance Sheet link, THE Customer Portal System SHALL navigate to route "/finance"

### Requirement 2: Create Dedicated Finance Sheet Page

**User Story:** As a customer, I want all financial data consolidated on one page, so that I can review financial information efficiently.

#### Acceptance Criteria

1. THE Customer Portal System SHALL create lazy-loaded FinanceModule at path "src/app/finance"
2. THE Customer Portal System SHALL create FinanceSheetComponent with mat-tab-group containing Invoice, Credit/Debit, Aging, and Overall Sales tabs
3. WHEN user navigates to "/finance", THE Customer Portal System SHALL load FinanceSheetComponent
4. THE Customer Portal System SHALL apply AuthGuard to "/finance" route
5. WHEN Finance Sheet loads, THE Customer Portal System SHALL display same tab functionality previously on dashboard

### Requirement 3: Simplify Dashboard Layout

**User Story:** As a customer, I want a clean dashboard showing key metrics and quick access, so that I can quickly understand my account status.

#### Acceptance Criteria

1. WHEN Dashboard renders, THE Customer Portal System SHALL display 5 KPI cards showing Total Inquiries, Total Sales Orders, Total Deliveries, Total Invoices, and Overall Sales Records
2. THE Customer Portal System SHALL NOT display Finance Sheet tabs on dashboard
3. WHEN Dashboard renders, THE Customer Portal System SHALL display Quick Access section with 4 navigation cards arranged horizontally
4. THE Customer Portal System SHALL load dashboard within 3 seconds under normal conditions
5. WHEN Dashboard loads, THE Customer Portal System SHALL call GET /api/dashboard/stats to retrieve KPI data



### Requirement 4: Implement Dashboard KPI Logic

**User Story:** As a customer, I want to see accurate counts of my inquiries, orders, deliveries, and invoices, so that I understand my account activity at a glance.

#### Acceptance Criteria

1. WHEN GET /api/dashboard/stats is called, THE Customer Portal System SHALL call ZRFC_CUST_INQUIRY_863 and return array length as totalInquiries
2. WHEN GET /api/dashboard/stats is called, THE Customer Portal System SHALL call ZRFC_SALEORDERS_863 and return array length as totalSalesOrders
3. WHEN GET /api/dashboard/stats is called, THE Customer Portal System SHALL call ZRFC_DELIVERY_LIST_863 and return array length as totalDeliveries
4. WHEN GET /api/dashboard/stats is called, THE Customer Portal System SHALL call ZRFC_INVOICE_DETAILS_863, count unique documentNumbers, and return count as totalInvoices
5. WHEN GET /api/dashboard/stats is called, THE Customer Portal System SHALL call ZRFC_OVERALLSALES_863 and return array length as totalOverallSales
6. THE Customer Portal System SHALL execute all 5 SAP service calls in parallel using Promise.all
7. WHEN any SAP service call fails, THE Customer Portal System SHALL return HTTP 500 with error message
8. THE Customer Portal System SHALL return HTTP 200 with JSON object containing all 5 KPI values

### Requirement 5: Convert Inquiry Form to Inquiry List

**User Story:** As a customer, I want to view my inquiry records in a table, so that I can review inquiry history.

#### Acceptance Criteria

1. THE Customer Portal System SHALL replace InquiryFormComponent with InquiryListComponent
2. WHEN Inquiry List renders, THE Customer Portal System SHALL display mat-table with columns: Document Number, Creation Date, Material Description, Net Value
3. WHEN Inquiry List loads, THE Customer Portal System SHALL call GET /api/inquiries
4. WHEN GET /api/inquiries succeeds, THE Customer Portal System SHALL populate table with inquiry records
5. WHEN GET /api/inquiries fails, THE Customer Portal System SHALL display error message "Failed to load inquiries"
6. THE Customer Portal System SHALL format Net Value using currency pipe with appropriate currency code

### Requirement 6: Implement Finance Sheet Tab Integration

**User Story:** As a customer, I want each Finance Sheet tab to display relevant financial data, so that I can analyze my financial information.

#### Acceptance Criteria

1. WHEN Invoice tab is active, THE Customer Portal System SHALL display InvoiceListComponent calling GET /api/invoices
2. WHEN Credit/Debit tab is active, THE Customer Portal System SHALL display CreditDebitListComponent calling GET /api/memos
3. WHEN Aging tab is active, THE Customer Portal System SHALL display AgingComponent calling GET /api/aging/summary
4. WHEN Overall Sales tab is active, THE Customer Portal System SHALL display OverallSalesComponent calling GET /api/sales/overall
5. THE Customer Portal System SHALL lazy-load tab content only when tab becomes active

### Requirement 7: Fix Change Detection Bug

**User Story:** As a customer, I want data to display immediately after loading, so that I don't need to interact twice to see information.

#### Acceptance Criteria

1. WHEN any component loads data from API, THE Customer Portal System SHALL inject ChangeDetectorRef
2. WHEN API response is received and data is assigned to component properties, THE Customer Portal System SHALL call this.cdr.detectChanges()
3. WHEN DashboardComponent loads KPI data, THE Customer Portal System SHALL trigger change detection after data assignment
4. WHEN InvoiceListComponent loads invoice data, THE Customer Portal System SHALL trigger change detection after data assignment
5. WHEN any list component loads data, THE Customer Portal System SHALL display data immediately without requiring user interaction

### Requirement 8: Fix Quick Access Layout

**User Story:** As a customer, I want Quick Access links displayed horizontally, so that the layout is visually appealing and space-efficient.

#### Acceptance Criteria

1. WHEN Dashboard renders Quick Access section, THE Customer Portal System SHALL apply CSS display: flex to container
2. THE Customer Portal System SHALL apply CSS flex-direction: row to Quick Access container
3. WHEN Dashboard renders on desktop, THE Customer Portal System SHALL display 4 Quick Access cards in horizontal row
4. THE Customer Portal System SHALL apply appropriate spacing between Quick Access cards
5. WHEN Dashboard renders on mobile, THE Customer Portal System SHALL wrap Quick Access cards to multiple rows if needed

### Requirement 9: Ensure Consistent Data Mapping

**User Story:** As a developer, I want consistent property naming between backend and frontend, so that data displays correctly without mapping errors.

#### Acceptance Criteria

1. THE Customer Portal System SHALL map all SAP field names (DOCUMENT_NUMBER, CREATION_DATE, etc.) to camelCase format (documentNumber, creationDate) in middleware
2. THE Customer Portal System SHALL use camelCase property names in all TypeScript interfaces
3. THE Customer Portal System SHALL use camelCase property names in all Angular templates
4. WHEN middleware returns JSON response, THE Customer Portal System SHALL use camelCase property names consistently
5. THE Customer Portal System SHALL document Master Data Contract with property name mappings

### Requirement 10: Implement All Required API Endpoints

**User Story:** As a system, I need complete API coverage for all portal features, so that frontend can retrieve all necessary data.

#### Acceptance Criteria

1. THE Customer Portal System SHALL implement GET /api/dashboard/stats endpoint calling 5 SAP services
2. THE Customer Portal System SHALL implement GET /api/inquiries endpoint calling ZRFC_CUST_INQUIRY_863
3. THE Customer Portal System SHALL implement GET /api/invoices endpoint calling ZRFC_INVOICE_DETAILS_863
4. THE Customer Portal System SHALL implement GET /api/memos endpoint calling ZRFC_MEMOS_863
5. THE Customer Portal System SHALL implement GET /api/aging/summary endpoint calling ZRFC_AGING_863
6. THE Customer Portal System SHALL implement GET /api/sales/overall endpoint calling ZRFC_OVERALLSALES_863
7. THE Customer Portal System SHALL apply JWT authentication middleware to all API endpoints
8. WHEN any API endpoint receives request without valid JWT token, THE Customer Portal System SHALL return HTTP 401

### Requirement 11: Implement Error Handling and Loading States

**User Story:** As a customer, I want clear feedback when data is loading or errors occur, so that I understand the system status.

#### Acceptance Criteria

1. WHEN any component initiates API call, THE Customer Portal System SHALL display mat-spinner with loading message
2. WHEN API call completes successfully, THE Customer Portal System SHALL hide loading spinner and display data
3. WHEN API call fails, THE Customer Portal System SHALL display error message with retry button
4. THE Customer Portal System SHALL log errors to console for debugging without exposing sensitive data
5. WHEN user clicks retry button, THE Customer Portal System SHALL re-execute failed API call

### Requirement 12: Maintain Existing Feature Functionality

**User Story:** As a customer, I want all existing features to continue working after integration, so that my workflow is not disrupted.

#### Acceptance Criteria

1. THE Customer Portal System SHALL maintain Invoice list, detail, and PDF generation functionality
2. THE Customer Portal System SHALL maintain Delivery list and detail functionality
3. THE Customer Portal System SHALL maintain Sales Order list and detail functionality
4. THE Customer Portal System SHALL maintain Profile view and edit functionality
5. THE Customer Portal System SHALL maintain authentication and authorization functionality
6. WHEN user navigates to any existing feature, THE Customer Portal System SHALL display same functionality as before integration
