# Customer Portal Middleware - SOAP Integration

Node.js Express middleware for Customer Portal O2C project with SAP SOAP Web Services integration.

## Architecture

This middleware acts as a secure bridge between the Angular frontend and SAP backend:
- **Frontend Communication**: RESTful JSON API over HTTPS (port 3443)
- **Backend Communication**: SOAP Web Services to SAP (XML)
- **Authentication**: JWT tokens with 8-hour expiry

## Setup

### 1. Install Dependencies

```bash
cd middleware
npm install
```

This will install:
- `express` - Web server framework
- `soap` - SOAP client for SAP web services
- `jsonwebtoken` - JWT authentication
- `xml2js` - XML to JSON conversion
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 2. Configure Environment Variables

Edit the `.env` file with your SAP credentials:

```env
# SAP SOAP Configuration
SAP_BASE_URL=http://172.17.19.24:8000/sap/bc/srt/scs/sap
SAP_CLIENT=100
SAP_USER=your_actual_sap_username
SAP_PASSWORD=your_actual_sap_password

# JWT Configuration
JWT_SECRET=change_this_to_a_random_secret_key

# Server Configuration
PORT=3443
```

**IMPORTANT**: Replace `your_actual_sap_username` and `your_actual_sap_password` with real SAP credentials.

### 3. Generate SSL Certificates (if not already done)

For local development, generate self-signed certificates:

```bash
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
```

### 4. Start the Server

```bash
npm start
```

The server will run on `https://localhost:3443`

## Testing

### Health Check
```bash
curl -k https://localhost:3443/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Customer Portal Middleware is running",
  "timestamp": "2025-01-16T..."
}
```

### SOAP Configuration Test
```bash
curl -k https://localhost:3443/api/test/soap
```

Expected response:
```json
{
  "success": true,
  "message": "SOAP client service is loaded",
  "config": {
    "baseUrl": "http://172.17.19.24:8000/sap/bc/srt/scs/sap",
    "client": "100"
  }
}
```

## SAP SOAP Services

The middleware connects to these SAP SOAP services:

| Service Name | Purpose |
|--------------|---------|
| ZRFC_LOGIN_VALIDATE_863 | User authentication |
| ZRFC_CUSTREG_863 | User registration |
| ZRFC_CUSTOMER_PROFILE_863 | Customer profile |
| ZRFC_CUST_INQUIRY_863 | Inquiry data |
| ZRFC_SALEORDERS_863 | Sales orders |
| ZRFC_DELIVERY_LIST_863 | Deliveries |
| ZRFC_INVOICE_DETAILS_863 | Invoices |
| ZRFC_CDMEMO_863 | Credit/Debit memos |
| ZRFC_AGING_DETAIL_863 | Aging detail |
| ZRFC_AGING_SUMMARY_863 | Aging summary |
| ZRFC_OVERALLSALES_863 | Overall sales |

## Next Steps

1. ✅ Task 32: SOAP middleware setup (COMPLETED)
2. ✅ Task 33: Implement SOAP client service (COMPLETED)
3. ⏭️ Task 34: Implement JWT authentication middleware
4. ⏭️ Task 35: Implement real SAP authentication endpoint
5. ⏭️ Task 36: Connect Angular frontend to real authentication

## Troubleshooting

### "SSL certificates not found"
Run the certificate generation commands

### "Cannot connect to SAP"
- Check SAP_BASE_URL in .env is correct
- Verify SAP system is accessible from your network
- Test with: `curl http://172.17.19.24:8000/sap/bc/srt/scs/sap/ZRFC_LOGIN_VALIDATE_863?sap-client=100&wsdl`

### "SOAP Fault" errors
- Verify SAP_USER and SAP_PASSWORD are correct
- Check SAP_CLIENT is correct (usually 100)
- Ensure SAP web services are enabled and accessible
