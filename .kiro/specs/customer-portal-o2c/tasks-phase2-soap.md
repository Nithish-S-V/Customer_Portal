# Phase 2: Middleware & SAP Integration (SOAP-Based)

**IMPORTANT**: This plan supersedes the backend tasks (Phases 10-16) in the original tasks.md file. The SAP backend is already complete and exposed via SOAP Web Services. Your task is to build the Node.js middleware that connects the Angular frontend to these live SAP services.

## Critical Architecture Changes

**DO NOT USE**:
- ❌ node-rfc library (ignore original plan)
- ❌ Custom Z-tables in SAP (ZINVOICES, ZDELIVERIES, etc.)
- ❌ Mock authentication or ZUSERS table
- ❌ Direct RFC calls

**USE INSTEAD**:
- ✅ SOAP Web Services (strong-soap or node-soap library)
- ✅ Live SAP standard tables (KNA1, VBRK, VBAK, LIKP, BSID)
- ✅ Real SAP authentication (ZRFC_LOGIN_VALIDATE_863)
- ✅ XML/JSON transformation

## SAP SOAP Endpoints Reference

**Base URL**: `http://172.17.19.24:8000/sap/bc/srt/scs/sap/SERVICE_NAME?sap-client=100`

| Node.js REST Endpoint | HTTP Method | SAP SOAP Service | Purpose |
|----------------------|-------------|------------------|---------|
| /api/auth/login | POST | ZRFC_LOGIN_VALIDATE_863 | User Authentication |
| /api/auth/register | POST | ZRFC_CUSTREG_863 | New User Registration |
| /api/profile | GET | ZRFC_CUSTOMER_PROFILE_863 | Customer Profile View |
| /api/inquiries | GET | ZRFC_CUST_INQUIRY_863 | Inquiry Data (Dashboard) |
| /api/salesorders | GET | ZRFC_SALEORDERS_863 | Sale Order Data (Dashboard) |
| /api/deliveries | GET | ZRFC_DELIVERY_LIST_863 | List of Delivery (Dashboard) |
| /api/invoices | GET | ZRFC_INVOICE_DETAILS_863 | Invoice Details (Financial Sheet) |
| /api/memos | GET | ZRFC_CDMEMO_863 | Credit/Debit Memo (Financial Sheet) |
| /api/aging/detail | GET | ZRFC_AGING_DETAIL_863 | Payments and Aging (Detailed) |
| /api/aging/summary | GET | ZRFC_AGING_SUMMARY_863 | Payments and Aging (Summarized) |
| /api/sales/overall | GET | ZRFC_OVERALLSALES_863 | Overall Sales Data (Financial Sheet) |

---

## Phase 10: SOAP Middleware Setup

- [x] 32. Set up Node.js Express project with HTTPS and SOAP client


  - Create new Node.js project: `mkdir middleware && cd middleware && npm init -y`
  - Install dependencies: `npm install express https dotenv jsonwebtoken strong-soap cors body-parser xml2js`
  - Alternative SOAP library: `npm install soap` (if strong-soap has issues)
  - Create server.js as entry point
  - Generate self-signed SSL certificate for local testing:
    ```bash
    openssl genrsa -out server.key 2048
    openssl req -new -key server.key -out server.csr
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
    ```
  - Create HTTPS server on port 3443 with certificate files
  - Configure CORS to allow requests from http://localhost:4200
  - Add body-parser middleware for JSON parsing
  - Create .env file with:
    ```
    SAP_BASE_URL=http://172.17.19.24:8000/sap/bc/srt/scs/sap
    SAP_CLIENT=100
    SAP_USER=your_sap_username
    SAP_PASSWORD=your_sap_password
    JWT_SECRET=your_jwt_secret_key
    PORT=3443
    ```
  - Test server starts successfully: `node server.js`
  - _Requirements: 10.1, 11.1_

- [x] 33. Implement SOAP client service wrapper


  - Create services/soap-client.service.js
  - Import strong-soap (or soap) library
  - Create function `createSoapClient(serviceName)` that:
    - Constructs WSDL URL: `${SAP_BASE_URL}/${serviceName}?sap-client=${SAP_CLIENT}&wsdl`
    - Creates SOAP client with basic authentication (SAP_USER, SAP_PASSWORD)
    - Returns promise that resolves to SOAP client
  - Create function `callSoapService(serviceName, methodName, parameters)`:
    - Calls createSoapClient(serviceName)
    - Invokes SOAP method with parameters
    - Parses XML response and converts to JSON using xml2js
    - Handles SOAP faults and network errors
    - Returns JSON response
  - Add error logging with timestamp, service name, method name, error message
  - Export callSoapService function
  - Test SOAP connection by calling a simple service (e.g., ZRFC_CUSTOMER_PROFILE_863)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 34. Implement JWT authentication middleware



  - Create middleware/auth.middleware.js
  - Implement `authenticateToken(req, res, next)` function:
    - Extract token from Authorization header (Bearer scheme)
    - Verify token using jwt.verify() with JWT_SECRET
    - Decode token and attach user object to req.user (contains USER_ID, username, role)
    - Return HTTP 401 if token is missing or invalid
    - Call next() if token is valid
  - Create middleware/rbac.middleware.js with `requireRole(allowedRoles)` function:
    - Check req.user.role against allowed roles array
    - Return HTTP 403 if role not allowed
    - Call next() if role is allowed
  - Export both middleware functions
  - _Requirements: 1.3, 1.4, 11.2, 11.3, 11.4_

---

## Phase 11: Authentication Integration

- [x] 35. Implement real SAP authentication endpoint


  - Create routes/auth.routes.js
  - Implement POST /api/auth/login endpoint:
    - Extract username and password from request body
    - Call SOAP service: `callSoapService('ZRFC_LOGIN_VALIDATE_863', 'Execute', { USERNAME: username, PASSWORD: password })`
    - Check response for success flag (e.g., `response.SUCCESS === 'X'` or similar)
    - If successful:
      - Extract USER_ID, role, and other user info from SAP response
      - Generate JWT token with 8-hour expiry: `jwt.sign({ USER_ID, username, role }, JWT_SECRET, { expiresIn: '8h' })`
      - Return JSON: `{ success: true, token, user: { USER_ID, username, role } }`
    - If failed:
      - Return HTTP 401: `{ success: false, error: 'Invalid credentials' }`
    - Handle SOAP errors and return HTTP 500 with error message
  - Implement POST /api/auth/logout endpoint (returns success message, token invalidation is client-side)
  - Add routes to Express app in server.js: `app.use('/api/auth', authRoutes)`
  - Test login endpoint with Postman using real SAP credentials
  - _Requirements: 1.1, 1.2, 1.3, 11.2_

- [x] 36. Connect Angular frontend to real authentication API



  - Update src/app/shared/services/api.service.ts:
    - Change base URL to 'https://localhost:3443/api'
    - Ensure Authorization header includes token from localStorage
  - Update proxy.conf.json to proxy /api to https://localhost:3443 (if not already done)
  - Update src/app/auth/auth.service.ts:
    - Modify login() method to call real POST /api/auth/login endpoint
    - Store returned token in localStorage: `localStorage.setItem('jwt_token', response.token)`
    - Store user info: `localStorage.setItem('user', JSON.stringify(response.user))`
  - Test end-to-end login flow:
    - Enter real SAP credentials in Angular login form
    - Verify middleware calls ZRFC_LOGIN_VALIDATE_863
    - Verify JWT token is returned and stored
    - Verify dashboard loads after successful login
    - Verify protected routes require valid token
  - _Requirements: 1.1, 1.2, 1.5, 14.3_

---

## Phase 12: Dashboard Data Integration



- [ ] 37. Implement inquiry API endpoint
  - Create routes/dashboard.routes.js
  - Implement GET /api/inquiries endpoint:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user (from JWT token)
    - Call SOAP service: `callSoapService('ZRFC_CUST_INQUIRY_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON array of inquiries
    - Return JSON: `{ success: true, inquiries: [...] }`
    - Handle errors and return HTTP 500 with error message
  - Register routes in server.js: `app.use('/api', dashboardRoutes)`
  - Test endpoint with Postman (include Authorization header with valid JWT)
  - _Requirements: 9.1, 10.2, 10.3_

- [x] 38. Implement sales orders API endpoint

  - Add GET /api/salesorders endpoint to dashboard.routes.js:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user
    - Call SOAP service: `callSoapService('ZRFC_SALEORDERS_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON array of sales orders
    - Return JSON: `{ success: true, salesOrders: [...] }`
    - Handle errors
  - Test endpoint with Postman
  - _Requirements: 9.4, 10.2, 10.3_

- [x] 39. Implement deliveries API endpoint


  - Add GET /api/deliveries endpoint to dashboard.routes.js:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user
    - Call SOAP service: `callSoapService('ZRFC_DELIVERY_LIST_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON array of deliveries
    - Return JSON: `{ success: true, deliveries: [...] }`
    - Handle errors
  - Test endpoint with Postman
  - _Requirements: 7.1, 10.2, 10.3_

- [ ] 40. Update Angular dashboard to use real APIs
  - Update src/app/dashboard/dashboard/dashboard.ts:
    - Remove mock data
    - Call InquiryService.getInquiries() which calls GET /api/inquiries
    - Call InquiryService.getSalesOrderList() which calls GET /api/salesorders
    - Call DeliveryService.getDeliveryList() which calls GET /api/deliveries
  - Update respective services to call real API endpoints
  - Test dashboard loads real data from SAP
  - Verify loading spinners show during API calls
  - Verify error handling displays error messages
  - _Requirements: 2.1, 2.2, 7.1, 9.4_

---

## Phase 13: Financial Sheet Integration

- [x] 41. Implement invoices API endpoint


  - Create routes/financial.routes.js
  - Implement GET /api/invoices endpoint:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user
    - Call SOAP service: `callSoapService('ZRFC_INVOICE_DETAILS_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON array of invoices with line items
    - Return JSON: `{ success: true, invoices: [...] }`
    - Handle errors
  - Register routes in server.js: `app.use('/api', financialRoutes)`
  - Test endpoint with Postman
  - _Requirements: 3.1, 3.2, 4.1, 10.2, 10.3_

- [x] 42. Implement credit/debit memos API endpoint

  - Add GET /api/memos endpoint to financial.routes.js:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user
    - Optional query parameter: docType ('CREDIT' or 'DEBIT')
    - Call SOAP service: `callSoapService('ZRFC_CDMEMO_863', 'Execute', { USER_ID, DOC_TYPE: docType })`
    - Transform XML response to JSON array of credit/debit memos
    - Return JSON: `{ success: true, memos: [...] }`
    - Handle errors
  - Test endpoint with Postman
  - _Requirements: 6.1, 6.2, 10.2, 10.3_

- [x] 43. Implement aging reports API endpoints

  - Add GET /api/aging/detail endpoint to financial.routes.js:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user
    - Call SOAP service: `callSoapService('ZRFC_AGING_DETAIL_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON detailed aging report
    - Return JSON: `{ success: true, agingDetail: {...} }`
  - Add GET /api/aging/summary endpoint:
    - Call SOAP service: `callSoapService('ZRFC_AGING_SUMMARY_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON summary aging report
    - Return JSON: `{ success: true, agingSummary: {...} }`
  - Test both endpoints with Postman
  - _Requirements: 2.1, 10.2, 10.3_

- [x] 44. Implement overall sales API endpoint

  - Add GET /api/sales/overall endpoint to financial.routes.js:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user
    - Call SOAP service: `callSoapService('ZRFC_OVERALLSALES_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON overall sales data
    - Return JSON: `{ success: true, overallSales: {...} }`
    - Handle errors
  - Test endpoint with Postman
  - _Requirements: 2.1, 10.2, 10.3_

- [ ] 45. Update Angular financial components to use real APIs
  - Update src/app/invoice/invoice.service.ts:
    - Remove mock data
    - Implement getInvoiceList() to call GET /api/invoices
    - Implement getCreditDebitList(docType) to call GET /api/memos?docType=...
    - Implement getAgingDetail() to call GET /api/aging/detail
    - Implement getAgingSummary() to call GET /api/aging/summary
    - Implement getOverallSales() to call GET /api/sales/overall
  - Update invoice list, credit/debit, and dashboard components to use real data
  - Test all financial sheet tabs load real SAP data
  - Verify pagination works with real data
  - Verify search filters work
  - _Requirements: 2.1, 3.1, 3.2, 6.1, 6.2_

---

## Phase 14: Profile Integration

- [x] 46. Implement profile API endpoints



  - Create routes/profile.routes.js
  - Implement GET /api/profile endpoint:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user
    - Call SOAP service: `callSoapService('ZRFC_CUSTOMER_PROFILE_863', 'Execute', { USER_ID })`
    - Transform XML response to JSON customer profile
    - Return JSON: `{ success: true, profile: {...} }`
    - Handle errors
  - Implement PUT /api/profile endpoint:
    - Add authenticateToken middleware
    - Extract USER_ID from req.user and updated profile data from request body
    - Validate email format and phone length
    - Call SOAP service to update profile (if update service exists, otherwise return 501 Not Implemented)
    - Return JSON: `{ success: true, message: 'Profile updated successfully' }`
    - Handle errors
  - Register routes in server.js: `app.use('/api', profileRoutes)`
  - Test endpoints with Postman
  - _Requirements: 8.1, 8.4, 10.2, 10.3_

- [ ] 47. Update Angular profile components to use real APIs
  - Update src/app/profile/profile.service.ts:
    - Remove mock data
    - Implement getProfile() to call GET /api/profile
    - Implement updateProfile(profileData) to call PUT /api/profile
  - Update profile view and edit components to use real data
  - Test profile loads real customer data from SAP
  - Test profile update (if supported by SAP service)
  - _Requirements: 8.1, 8.2, 8.4_

---

## Phase 15: Registration Integration (Optional)

- [ ] 48. Implement user registration endpoint
  - Add POST /api/auth/register endpoint to auth.routes.js:
    - Extract registration data from request body (username, password, email, etc.)
    - Validate required fields
    - Call SOAP service: `callSoapService('ZRFC_CUSTREG_863', 'Execute', { ...registrationData })`
    - Check response for success flag
    - If successful, return JSON: `{ success: true, message: 'Registration successful' }`
    - If failed, return HTTP 400 with error message
    - Handle errors
  - Test endpoint with Postman
  - _Requirements: 1.1_

- [ ] 49. Create Angular registration component (if needed)
  - Generate RegistrationComponent in auth module
  - Create registration form with fields: username, password, confirm password, email, phone
  - Add form validation
  - Call AuthService.register(registrationData) which calls POST /api/auth/register
  - Display success message and redirect to login
  - Handle errors
  - _Requirements: 1.1_

---

## Phase 16: Error Handling and Optimization

- [ ] 50. Implement comprehensive error handling
  - Create middleware/error-handler.middleware.js:
    - Catch all errors from routes
    - Log errors with timestamp, endpoint, user ID, error message
    - Map SOAP faults to HTTP status codes:
      - Authentication failure → 401
      - Authorization failure → 403
      - Resource not found → 404
      - SOAP fault → 500
      - Network error → 503
    - Return user-friendly error messages (don't expose technical details)
    - Never log passwords or tokens
  - Add error handler middleware to server.js (must be last middleware)
  - Test error handling for various scenarios
  - _Requirements: 12.1, 12.2, 12.5_

- [ ] 51. Optimize SOAP client performance
  - Implement SOAP client caching:
    - Cache created SOAP clients by service name
    - Reuse cached clients instead of creating new ones for each request
    - Add cache expiration (e.g., 1 hour)
  - Add request timeout (30 seconds) to SOAP calls
  - Add retry logic for transient network failures (max 2 retries with exponential backoff)
  - Log performance metrics: request duration, service name, method name
  - _Requirements: 10.5, 10.6, 15.1, 15.2_

- [ ] 52. Final end-to-end testing
  - Test complete user journey:
    - Login with real SAP credentials → JWT token received
    - Dashboard loads real data from all SOAP services
    - Invoice list displays real invoices from SAP
    - Credit/debit memos load correctly
    - Aging reports display real data
    - Profile loads real customer data
    - Deliveries and sales orders display correctly
    - Logout clears token
  - Test error scenarios:
    - Invalid credentials → 401 error
    - Expired token → 401 error, redirect to login
    - SOAP service failure → 500 error with user-friendly message
    - Network timeout → 503 error
  - Test concurrent requests (10 simultaneous API calls)
  - Verify no sensitive data is logged
  - Document any issues found
  - _Requirements: All requirements_

- [ ]* 52.1 Create deployment documentation
  - Document environment variables required in .env
  - Document SAP SOAP service endpoints and their purposes
  - Document JWT token structure and expiry
  - Document error codes and their meanings
  - Create troubleshooting guide for common SOAP connection issues
  - Document how to test each endpoint with Postman
  - _Requirements: All requirements_

---

## PDF Generation (Postponed)

- [ ] 53. Stub PDF generation endpoint
  - Add GET /api/invoice/:id/form endpoint to financial.routes.js:
    - Add authenticateToken middleware
    - Return HTTP 501 Not Implemented: `{ success: false, error: 'PDF generation is not yet implemented' }`
    - Add TODO comment: "Implement ZRP_INVOICE_PDF_CONV_FM SOAP service call when available"
  - Update Angular InvoiceService.generateInvoiceForm() to handle 501 response
  - Display message: "PDF generation is coming soon"
  - _Requirements: 4.5, 4.6, 4.7_

---

## Summary of Key Differences from Original Plan

**Removed Tasks** (DO NOT IMPLEMENT):
- ❌ Task 33: RFC connection pool (use SOAP instead)
- ❌ Tasks 45-55: Creating custom Z-tables in SAP (use live SAP tables)
- ❌ Tasks 45-46: Mock authentication or ZUSERS table (use ZRFC_LOGIN_VALIDATE_863)
- ❌ Tasks 56-60: Smart Forms implementation (postponed)

**New Tasks** (IMPLEMENT THESE):
- ✅ Task 32-33: SOAP client setup with strong-soap/node-soap
- ✅ Task 35: Real SAP authentication via ZRFC_LOGIN_VALIDATE_863
- ✅ Tasks 37-45: SOAP service integration for all 11 endpoints
- ✅ Tasks 50-51: Error handling and SOAP client optimization

**Architecture Change**:
- Old: Angular → Node.js (RFC) → SAP ABAP Function Modules
- New: Angular → Node.js (SOAP/XML) → SAP SOAP Web Services → Live SAP Tables
