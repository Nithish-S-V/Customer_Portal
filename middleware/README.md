# Customer Portal O2C Middleware

Node.js Express middleware server for the Customer Portal Order-to-Cash system.

## Features

- HTTPS server on port 3443
- CORS enabled for Angular frontend (http://localhost:4200)
- JWT authentication
- RFC connection to SAP backend (to be implemented)
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- OpenSSL (for generating SSL certificates)
- SAP NetWeaver RFC SDK (for node-rfc, to be installed later)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate SSL certificates:**
   
   Option A - Using Node.js script:
   ```bash
   node generate-certs.js
   ```
   
   Option B - Using OpenSSL directly (if available):
   ```bash
   openssl genrsa -out server.key 2048
   openssl req -new -key server.key -out server.csr -subj "/C=US/ST=State/L=City/O=KaarTech/CN=localhost"
   openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
   ```
   
   Option C - Using Git Bash (includes OpenSSL):
   ```bash
   # Open Git Bash in the middleware directory
   openssl genrsa -out server.key 2048
   openssl req -new -key server.key -out server.csr
   openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
   ```

3. **Configure environment variables:**
   
   Edit the `.env` file with your SAP connection details:
   ```
   SAP_HOST=your-sap-host-ip
   SAP_PORT=3200
   SAP_USER=your-sap-username
   SAP_PASSWORD=your-sap-password
   SAP_CLIENT=100
   SAP_LANG=EN
   JWT_SECRET=your-secret-key-change-this
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Testing

Once the server is running, test the health check endpoint:

```bash
# Using curl (if available)
curl -k https://localhost:3443/api/health

# Or open in browser (accept the self-signed certificate warning)
https://localhost:3443/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Customer Portal Middleware is running",
  "timestamp": "2025-11-13T05:00:00.000Z"
}
```

## Project Structure

```
middleware/
├── server.js              # Main Express server
├── .env                   # Environment variables
├── server.key             # SSL private key (generated)
├── server.cert            # SSL certificate (generated)
├── generate-certs.js      # Certificate generation script
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Next Steps

1. Install node-rfc package (requires SAP NetWeaver RFC SDK)
2. Implement RFC connection pool service
3. Implement JWT authentication middleware
4. Create API route handlers for:
   - Authentication (/api/auth)
   - Invoices (/api/invoice)
   - Payments (/api/payment)
   - Deliveries (/api/delivery)
   - Profile (/api/profile)
   - Inquiries (/api/inquiry)

## Notes

- The server uses self-signed certificates for development
- In production, use proper SSL certificates from a trusted CA
- The `node-rfc` package requires Python and build tools to compile
- For initial development, mock data can be used instead of SAP RFC calls
