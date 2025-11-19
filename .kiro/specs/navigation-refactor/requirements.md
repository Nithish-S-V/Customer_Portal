# Requirements Document

## Introduction

This document defines the requirements for refactoring the Customer Portal's navigation structure and core components to align with finalized backend capabilities and improve user experience. The refactoring removes unnecessary payment features, converts the inquiry form into a data list, promotes the Finance Sheet to top-level navigation, and simplifies the dashboard layout.

## Glossary

- **Customer Portal System**: The Angular-based web application for customer self-service
- **Finance Sheet**: Dedicated page containing tabs for Invoice, Credit/Debit, Aging, and Overall Sales financial data
- **Inquiry List**: Data table displaying inquiry records retrieved from SAP via ZFM_CUST_INQUIRY_RP_863 function
- **Sidebar Navigation**: Left-side navigation menu containing links to main portal features
- **Dashboard**: Landing page after login showing KPI cards and quick access links
- **ZFM_CUST_INQUIRY_RP_863**: SAP ABAP function module that returns inquiry data for display

## Requirements

### Requirement 1: Remove Payment Features from Navigation

**User Story:** As a customer, I want to see only the features that are available in the portal, so that I am not confused by non-functional menu items.

#### Acceptance Criteria

1. WHEN the sidebar navigation renders, THE Customer Portal System SHALL NOT display a navigation link for "Payment List"
2. WHEN the sidebar navigation renders, THE Customer Portal System SHALL NOT display a navigation link for "Payment Form"
3. THE Customer Portal System SHALL maintain existing payment module code without deletion for potential future use
4. WHEN a user attempts to navigate directly to /payment routes via URL, THE Customer Portal System SHALL redirect to dashboard

### Requirement 2: Rename Inquiry Form to Inquiries

**User Story:** As a customer, I want the navigation to accurately reflect that inquiries are displayed as a list, so that I understand what to expect when clicking the link.

#### Acceptance Criteria

1. WHEN the sidebar navigation renders, THE Customer Portal System SHALL display navigation link text as "Inquiries" instead of "Inquiry Form"
2. THE Customer Portal System SHALL use an appropriate Material icon for the Inquiries navigation link
3. THE Customer Portal System SHALL maintain the existing route path for backward compatibility

### Requirement 3: Add Finance Sheet to Top-Level Navigation

**User Story:** As a customer, I want quick access to all financial data from the main navigation, so that I can efficiently review my financial information.

#### Acceptance Criteria

1. WHEN the sidebar navigation renders, THE Customer Portal System SHALL display a new top-level navigation link labeled "Finance Sheet"
2. THE Customer Portal System SHALL use Material icon "account_balance" or "monetization_on" for the Finance Sheet link
3. WHEN a user clicks the Finance Sheet link, THE Customer Portal System SHALL navigate to route "/finance"
4. THE Customer Portal System SHALL highlight the Finance Sheet link when the current route is "/finance"

### Requirement 4: Reorder Sidebar Navigation

**User Story:** As a customer, I want the navigation menu organized in a logical order, so that I can quickly find the features I need.

#### Acceptance Criteria

1. THE Customer Portal System SHALL display sidebar navigation links in the following order: Dashboard, Finance Sheet, Invoice, Delivery, Inquiries, Sales Orders, Credit/Debit, Profile
2. WHEN the sidebar renders, THE Customer Portal System SHALL display all navigation items with consistent spacing and styling
3. THE Customer Portal System SHALL maintain active route highlighting for all navigation items

### Requirement 5: Create Dedicated Finance Sheet Module and Component

**User Story:** As a customer, I want to access comprehensive financial data on a dedicated page, so that I can review all financial information in one place.

#### Acceptance Criteria

1. THE Customer Portal System SHALL create a new lazy-loaded FinanceModule at path "src/app/finance"
2. THE Customer Portal System SHALL create FinanceSheetComponent as the main component in FinanceModule
3. WHEN FinanceSheetComponent renders, THE Customer Portal System SHALL display a mat-tab-group containing tabs for Invoice, Credit/Debit, Aging, and Overall Sales
4. THE Customer Portal System SHALL configure lazy loading route "/finance" that loads FinanceModule
5. THE Customer Portal System SHALL apply AuthGuard to the "/finance" route to require authentication

### Requirement 6: Move Financial Tabs from Dashboard to Finance Sheet

**User Story:** As a customer, I want the financial data tabs moved to their own page, so that the dashboard is simpler and financial data has more dedicated space.

#### Acceptance Criteria

1. THE Customer Portal System SHALL remove the mat-tab-group element from dashboard.component.html
2. THE Customer Portal System SHALL move the complete mat-tab-group element to finance-sheet.component.html
3. WHEN Finance Sheet page loads, THE Customer Portal System SHALL display the same tab functionality that previously existed on the dashboard
4. THE Customer Portal System SHALL maintain all existing tab content and functionality without modification

### Requirement 7: Convert Inquiry Form to Inquiry List

**User Story:** As a customer, I want to view a list of inquiry records from SAP, so that I can see inquiry data instead of submitting new inquiries.

#### Acceptance Criteria

1. THE Customer Portal System SHALL rename InquiryFormComponent to InquiryListComponent or create a new InquiryListComponent
2. WHEN Inquiry List page renders, THE Customer Portal System SHALL display a mat-table instead of form fields
3. THE Customer Portal System SHALL call GET /api/inquiries endpoint to retrieve inquiry data
4. THE Customer Portal System SHALL display table columns for: Document Number, Creation Date, Created By, Material Description, Net Value, Currency
5. WHEN the API call to /api/inquiries succeeds, THE Customer Portal System SHALL populate the table with returned inquiry records
6. WHEN the API call to /api/inquiries fails, THE Customer Portal System SHALL display error message "Failed to load inquiries. Please try again later."

### Requirement 8: Implement Inquiry API Endpoint

**User Story:** As a system, I need to retrieve inquiry data from SAP, so that the inquiry list can display real data.

#### Acceptance Criteria

1. THE Customer Portal System SHALL implement GET /api/inquiries endpoint in the Node.js middleware
2. WHEN GET /api/inquiries is called, THE Customer Portal System SHALL call SAP function module ZFM_CUST_INQUIRY_RP_863
3. THE Customer Portal System SHALL pass customer ID from JWT token to ZFM_CUST_INQUIRY_RP_863 as input parameter
4. WHEN ZFM_CUST_INQUIRY_RP_863 returns data successfully, THE Customer Portal System SHALL return HTTP 200 with inquiry records in JSON format
5. WHEN ZFM_CUST_INQUIRY_RP_863 returns error, THE Customer Portal System SHALL return HTTP 500 with error message
6. THE Customer Portal System SHALL apply JWT authentication middleware to GET /api/inquiries endpoint

### Requirement 9: Simplify Dashboard Component

**User Story:** As a customer, I want a clean dashboard that shows key metrics and quick access links, so that I can quickly understand my account status and navigate to detailed pages.

#### Acceptance Criteria

1. WHEN Dashboard page renders, THE Customer Portal System SHALL display the top row of KPI cards showing Total Inquiries, Total Sales Orders, Total Invoices, and Total Deliveries
2. THE Customer Portal System SHALL NOT display the mat-tab-group that was moved to Finance Sheet
3. WHEN Dashboard page renders, THE Customer Portal System SHALL display a "Quick Access" section at the bottom with navigation cards or links
4. THE Customer Portal System SHALL maintain existing KPI card styling and layout
5. THE Customer Portal System SHALL load dashboard data within 3 seconds under normal network conditions

### Requirement 10: Update Routing Configuration

**User Story:** As a developer, I want the routing configuration updated to support the new navigation structure, so that all navigation links work correctly.

#### Acceptance Criteria

1. THE Customer Portal System SHALL add lazy-loaded route configuration for "/finance" in app-routing.module.ts
2. THE Customer Portal System SHALL use loadChildren syntax to lazy load FinanceModule
3. THE Customer Portal System SHALL apply AuthGuard to the "/finance" route
4. THE Customer Portal System SHALL maintain existing route configurations for other modules
5. WHEN a user navigates to "/finance", THE Customer Portal System SHALL load FinanceModule and display FinanceSheetComponent

### Requirement 11: Maintain Existing Functionality

**User Story:** As a customer, I want all existing features to continue working after the refactoring, so that my workflow is not disrupted.

#### Acceptance Criteria

1. THE Customer Portal System SHALL maintain all existing functionality for Invoice, Delivery, Sales Orders, Credit/Debit, and Profile features
2. THE Customer Portal System SHALL maintain all existing API endpoints except those related to payment processing
3. THE Customer Portal System SHALL maintain all existing authentication and authorization logic
4. WHEN users navigate to existing feature pages, THE Customer Portal System SHALL display the same content and functionality as before the refactoring
5. THE Customer Portal System SHALL maintain all existing error handling and loading states

### Requirement 12: Preserve Code for Future Use

**User Story:** As a developer, I want payment-related code preserved but not deleted, so that it can be reactivated if payment features are needed in the future.

#### Acceptance Criteria

1. THE Customer Portal System SHALL NOT delete PaymentModule, PaymentListComponent, or PaymentFormComponent files
2. THE Customer Portal System SHALL NOT delete payment-related routes in payment-routing.module.ts
3. THE Customer Portal System SHALL NOT delete PaymentService or payment-related API endpoints in middleware
4. THE Customer Portal System SHALL comment out or disable payment routes in app-routing.module.ts
5. THE Customer Portal System SHALL add code comments indicating that payment features are disabled but preserved for future use
