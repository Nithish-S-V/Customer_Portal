# Customer Portal Development Prompt - Practice Project
## Based on "Simplified Customer Portal Development Guide"

---

## Project Overview

Build a **basic Order-to-Cash (O2C) customer portal** for KaarTech using **Angular, Node.js RFC middleware, and SAP ABAP backend**. This is a **practice/learning project** focused on core functionality, not enterprise-scale features.

**Key Principle:** Pragmatic development—implement only MUST-HAVE features, skip advanced enterprise patterns.

---

## Technology Stack (Non-Negotiable)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Angular 15+ | Single Page Application (SPA) with Material Design |
| Middleware | Node.js + Express | RFC connection pooling, API gateway, authentication |
| Backend | SAP ERP (On-Premise) | ABAP function modules for business logic |
| Integration | RFC Protocol | Direct binary communication (node-rfc library) |
| Security | HTTPS/TLS + JWT | Basic encryption + token-based authentication |

**Deployment:** On-premise SAP system (no SAP Cloud Connector needed for practice)

---

## Architecture Flow

```
Angular Frontend (Dashboard, Invoice List)
         ↓ (HTTPS/REST)
Node.js Middleware (RFC Pool: 5 connections)
         ↓ (RFC Binary Protocol)
SAP ABAP Backend (Function Modules + Smart Forms)
```

---

## Core Features (MUST HAVE)

### 1. **Authentication & Login**
- Username/password login page (Angular)
- Token validation via SAP function module (Z_RFC_VALIDATE_USER)
- JWT token generation (8-hour expiry, no MFA)
- Logout functionality

### 2. **Dashboard**
- Display KPI cards: Total Invoices, Total Amount, Paid, Pending
- Show recent invoices as clickable cards (Material Cards)
- Summary statistics from SAP

### 3. **Invoice Management**
- Invoice list page with table view
- Display: Invoice Number, Amount, Date, Status
- Pagination support (Skip/Top parameters in RFC)
- Click invoice → Generate Smart Form as PDF in new tab

### 4. **Smart Forms Integration**
- Backend generates invoice PDF (SAP Smart Form - transaction SMARTFORMS)
- Form called dynamically: Z_DISPLAY_INVOICE_FORM
- PDF returned as blob to Angular frontend
- User can view/print in browser

### 5. **Error Handling**
- Structured error responses (HTTP 400/500)
- User-friendly error messages (no raw SAP errors)
- Console logging (no field masking for practice)
- SY-SUBRC checks after all RFC calls

### 6. **Basic Security**
- HTTPS/TLS between Angular ↔ Node.js (self-signed cert for local testing)
- JWT token validation on protected endpoints
- Basic RBAC: Admin vs User roles
- Password validation via RFC call to SAP

---

## ABAP Backend Requirements

### Function Module Naming Convention
- Naming pattern: `Z_MODULE_ACTION_ENTITY`
- Examples: `Z_INVOICE_GET_LIST`, `Z_INVOICE_GET_DETAILS`, `Z_INVOICE_CREATE_FORM`
- Parameter prefixes: `IV_` (importing), `EV_` (exporting), `IT_` (table)

### Required Function Modules (Minimum)

| Module Name | Purpose | Inputs | Outputs |
|------------|---------|--------|---------|
| Z_RFC_VALIDATE_USER | User authentication | IV_USERNAME, IV_PASSWORD | EV_VALID, EV_ROLE |
| Z_INVOICE_GET_LIST | Fetch invoice list | IV_CUSTOMER_ID, IV_SKIP, IV_TOP | ET_INVOICES, EV_TOTAL_COUNT |
| Z_INVOICE_GET_DETAILS | Invoice details | IV_INVOICE_ID | ET_LINE_ITEMS, EV_TOTAL_AMOUNT |
| Z_INVOICE_CREATE_FORM | Generate PDF form | IV_INVOICE_ID | EV_PDF_BLOB |
| Z_PAYMENT_GET_LIST | Payment history | IV_CUSTOMER_ID | ET_PAYMENTS |
| Z_CUSTOMER_GET_PROFILE | Customer details | IV_CUSTOMER_ID | ES_CUSTOMER |

### ABAP Standards (Non-Negotiable)
- **Data Dictionary Elements:** Use SAP Dictionary types (BELNR, KUNNR, DMBTR), NOT generic types (C, N)
- **Exception Handling:** TRY-CATCH-CLEANUP blocks with custom exception classes
- **SY-SUBRC Checks:** Check return code after SELECT, UPDATE, DELETE, CALL FUNCTION
- **COMMIT After BAPI:** Always call BAPI_TRANSACTION_COMMIT after BAPIs modify data
- **Error Responses:** Structured format → { "success": false, "error": "message", "code": "001" }

### Smart Forms Implementation
- Create form in transaction SMARTFORMS (name: ZSF_INVOICE)
- Store invoice data in table row format
- Generate PDF on demand via function module call
- Return as binary blob to Node.js

---

## Node.js Middleware Requirements

### RFC Connection Pool Setup
```javascript
const Pool = require('node-rfc').Pool;
const rfcPool = new Pool({ connectionParameters: rfcConfig });
rfcPool.open(5); // Maintain 5 connections, no more
```

### Express Server Structure
- Port: 3443 (HTTPS)
- API endpoints: /api/auth, /api/invoice, /api/payment, /api/customer
- Middleware: HTTPS, JWT validation, error handler
- Logging: Console logs (no external tools for practice)

### RFC Integration Pattern
1. Acquire connection from pool
2. Call RFC function module with parameters
3. Check SY-SUBRC response
4. Return structured JSON response
5. Release connection to pool

### Error Handling
- Catch RFC errors → Transform to HTTP 500
- Catch validation errors → HTTP 400
- Log timestamp, endpoint, error (no sensitive data)

---

## Angular Frontend Requirements

### Architecture (Module-Based)
- **Root Module:** AppModule (imports all features)
- **Auth Module:** Login feature (lazy-loaded)
- **Invoice Module:** Invoice list/detail (lazy-loaded)
- **Shared Module:** Navbar, Sidebar, Common components
- **Lazy Loading:** Routes load modules on-demand (faster initial load)

### Required Components
1. **LoginComponent** - Username/password form, JWT token storage
2. **DashboardComponent** - KPI cards, recent invoices
3. **InvoiceListComponent** - Table/card view with pagination
4. **InvoiceDetailComponent** - Invoice details + Smart Form trigger
5. **NavbarComponent** - Navigation, user menu, logout
6. **SidebarComponent** - Module navigation

### UI Library: Angular Material
- Install: `ng add @angular/material`
- Use: mat-card, mat-table, mat-spinner, mat-button for Material components
- Styling: Simple CSS (responsive for desktop first, mobile later)

### Service Layer
- **ApiService:** HTTP calls to Node.js backend
- **AuthService:** Login, token management, role storage
- **InvoiceService:** RFC calls for invoice data
- **PaginationService:** Skip/Top logic

### State Management
- **NOT** NgRx (too complex for practice)
- Use: RxJS Observables + Simple Services
- Shared data via service injection

---

## Feature Implementation Timeline

### Week 1: Infrastructure
- [ ] Set up Node.js Express + RFC pool
- [ ] Configure HTTPS (self-signed cert)
- [ ] Create SAP connection config
- [ ] Test RFC connectivity

### Week 2: Authentication
- [ ] Implement Z_RFC_VALIDATE_USER in SAP
- [ ] Create login component + API endpoint
- [ ] JWT token generation + storage
- [ ] Protected route middleware

### Week 3: Dashboard & Invoices
- [ ] Dashboard with KPI cards
- [ ] Invoice list with Material table
- [ ] Pagination (Skip/Top)
- [ ] Invoice detail page

### Week 4: Smart Forms
- [ ] Create Smart Form in SAP (ZSF_INVOICE)
- [ ] Implement Z_INVOICE_CREATE_FORM
- [ ] PDF generation endpoint in Node.js
- [ ] PDF viewer in Angular

### Week 5: Polish & Testing
- [ ] Unit tests (Angular services)
- [ ] Integration tests (RFC mock)
- [ ] Error handling refinement
- [ ] UI/UX improvements

---

## Security Requirements (Minimal but Essential)

| Feature | Implementation | Effort |
|---------|-----------------|--------|
| HTTPS/TLS | Self-signed cert (local), replace for production | 30 min |
| JWT Auth | Token in Authorization header (Bearer scheme) | 1 hour |
| RBAC | Admin/User role check in endpoints | 1 hour |
| Password hashing | NOT needed (SAP handles), just RFC validation | - |
| Sensitive logging | Don't log passwords, tokens, personal data | 15 min |

**SKIP for Practice:**
- ❌ MFA (Multi-factor authentication)
- ❌ Rate limiting
- ❌ CAPTCHA
- ❌ SNC encryption for RFC
- ❌ Field masking in logs

---

## Data Models (Example)

### Invoice Object
```typescript
{
  invoiceNumber: string;
  customerId: string;
  amount: decimal;
  currency: string;
  date: date;
  dueDate: date;
  status: 'Open' | 'Paid' | 'Overdue';
  lineItems: LineItem[];
}
```

### Line Item Object
```typescript
{
  itemNumber: int;
  productCode: string;
  description: string;
  quantity: decimal;
  unitPrice: decimal;
  totalPrice: decimal;
  tax: decimal;
}
```

---

## Testing Requirements (Basic)

| Test Type | Scope | Tools | Time |
|-----------|-------|-------|------|
| Unit Tests | Angular services (Jasmine) | ng test | 2 hours |
| Integration | Mock RFC responses | HttpTestingModule | 2 hours |
| E2E | Full flow (login → invoice) | Protractor or Cypress | 3 hours (optional) |
| Manual Testing | Browser DevTools, SAP console | Manual | Ongoing |

**SKIP:**
- ❌ Load testing (JMeter)
- ❌ Security testing (Penetration)
- ❌ Performance profiling

---

## API Endpoints (Node.js)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/auth/login | Validate user, return JWT | None |
| POST | /api/auth/logout | Clear session | JWT |
| GET | /api/invoice/list | Get invoices (paginated) | JWT |
| GET | /api/invoice/:id | Invoice details | JWT |
| GET | /api/invoice/:id/form | Generate & download PDF | JWT |
| GET | /api/payment/list | Payment history | JWT |
| GET | /api/customer/profile | Customer details | JWT |

---

## Deployment Considerations

### For This Practice Project
- **Server:** Local development (localhost:3443)
- **SAP Connection:** Direct RFC to on-premise SAP system
- **Database:** Use existing SAP tables (ZINVOICES, ZCUSTOMERS, etc.)
- **Frontend Hosting:** ng serve (Angular CLI dev server)

### For Future Production (NOT NOW)
- Use SAP Cloud Connector for cloud deployment
- Implement SNC encryption for RFC
- Add load balancing for Node.js
- Use SAP BTP for scalability
- Migrate to OData/REST APIs

---

## Known Limitations (By Design)

1. **Single Tenant:** No multi-tenant support (practice project)
2. **No Real-Time Sync:** Data fetched on-demand, no WebSockets
3. **Offline Access:** NOT supported (add PWA later if needed)
4. **Pagination Simple:** Basic skip/top, no complex filtering
5. **Smart Forms Static:** Fixed template, no dynamic field rendering
6. **No Caching:** Every request hits SAP database

---

## Success Criteria

✅ **Portal is production-ready when:**
1. Login works with JWT tokens
2. Invoice list loads and displays 50+ invoices
3. Smart Form generates PDF on click
4. Pagination works (load 10 invoices at a time)
5. Error messages are user-friendly
6. Dashboard shows accurate KPI totals
7. Code is documented with inline comments

---

## Helpful Resources

- **Angular:** Angular official docs, Material UI components
- **Node.js RFC:** node-rfc npm package, SAP NetWeaver RFC SDK
- **ABAP:** SAP ABAP language reference, transaction SE80 (ABAP editor)
- **Smart Forms:** Transaction SMARTFORMS, SAP Learning Hub
- **JWT:** jwt.io library, Express middleware docs

---

## Code Quality Guidelines

- **Comments:** Explain "why," not "what"
- **Naming:** Descriptive variable names (no `x`, `y`, `temp`)
- **Error Messages:** User-friendly, actionable (not technical)
- **DRY:** Don't repeat code—create shared functions
- **Single Responsibility:** Each function/component does one thing

---

## Support & Troubleshooting

| Problem | Solution |
|---------|----------|
| RFC connection refused | Check SAP IP, port 3200, firewall |
| SY-SUBRC 4 (not found) | Data doesn't exist in SAP table |
| PDF not downloading | Check Smart Form output format |
| JWT token expired | Refresh by re-login |
| CORS errors | Frontend ≠ Backend URL, use proxy |

---

## Additional Notes

- **Version Tracking:** Start at 1.0.0, increment on changes
- **Git Commits:** Commit after each feature (Auth → Invoice → Forms)
- **Environment Variables:** Store SAP credentials in `.env` file
- **Feedback Loop:** Test weekly, iterate based on errors

---

**This is a pragmatic, practice-project approach. Follow this prompt to build a functional, learnable customer portal without over-engineering. Good luck! 🚀**
