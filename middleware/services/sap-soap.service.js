const http = require('http');
const https = require('https');
const xml2js = require('xml2js');

/**
 * SAP SOAP Service - Raw XML Implementation
 * Sends raw XML payloads to SAP SOAP endpoints using the exact pattern from Postman
 */
class SapSoapService {
  constructor() {
    this.baseUrl = process.env.SAP_BASE_URL || 'http://172.17.19.24:8000/sap/bc/srt/scs/sap';
    this.client = process.env.SAP_CLIENT || '100';
    this.username = process.env.SAP_USER;
    this.password = process.env.SAP_PASSWORD;
    
    if (!this.username || !this.password) {
      throw new Error('SAP_USER and SAP_PASSWORD must be configured in .env file');
    }
  }

  /**
   * Creates the SOAP envelope with the specific function call
   * @param {string} functionXml - The XML content for the specific function call
   * @returns {string} Complete SOAP envelope
   */
  createSoapEnvelope(functionXml) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
        ${functionXml}
    </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Makes a SOAP call to SAP with the specified service and XML payload
   * @param {string} serviceName - SAP service name (e.g., 'ZRFC_LOGIN_VALIDATE_863')
   * @param {string} functionXml - XML content for the function call
   * @returns {Promise<Object>} Parsed response from SAP
   */
  async callSapService(serviceName, functionXml) {
    const startTime = Date.now();
    
    try {
      console.log(`[SAP-SOAP] Calling service: ${serviceName}`);
      console.log(`[SAP-SOAP] Function XML:`, functionXml);

      // Create complete SOAP envelope
      const soapEnvelope = this.createSoapEnvelope(functionXml);
      console.log(`[SAP-SOAP] Complete SOAP envelope:`, soapEnvelope);

      // Construct service URL
      const serviceUrl = `${this.baseUrl}/${serviceName}?sap-client=${this.client}`;
      console.log(`[SAP-SOAP] Service URL: ${serviceUrl}`);

      // Create Basic Auth header
      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');

      // Make HTTP request
      const response = await this.makeHttpRequest(serviceUrl, soapEnvelope, auth);
      
      const duration = Date.now() - startTime;
      console.log(`[SAP-SOAP] Call completed in ${duration}ms`);
      console.log(`[SAP-SOAP] Raw response:`, response);

      // Parse XML response
      const parsedResponse = await this.parseXmlResponse(response);
      console.log(`[SAP-SOAP] Parsed response:`, JSON.stringify(parsedResponse, null, 2));

      return parsedResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[SAP-SOAP] Error calling ${serviceName} (${duration}ms):`, error.message);
      throw error;
    }
  }

  /**
   * Makes the actual HTTP request to SAP
   * @param {string} url - Complete service URL
   * @param {string} soapEnvelope - SOAP XML payload
   * @param {string} auth - Base64 encoded auth string
   * @returns {Promise<string>} Raw XML response
   */
  makeHttpRequest(url, soapEnvelope, auth) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'urn:sap-com:document:sap:rfc:functions',
          'Authorization': `Basic ${auth}`,
          'Content-Length': Buffer.byteLength(soapEnvelope, 'utf8')
        },
        timeout: 30000 // 30 seconds timeout
      };

      console.log(`[SAP-SOAP] Request options:`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': 'Basic [HIDDEN]' // Don't log credentials
        }
      });

      const req = httpModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`[SAP-SOAP] Response status: ${res.statusCode}`);
          console.log(`[SAP-SOAP] Response headers:`, res.headers);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error(`[SAP-SOAP] Request error:`, error);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout after 30 seconds'));
      });

      // Send the SOAP envelope
      req.write(soapEnvelope);
      req.end();
    });
  }

  /**
   * Parses XML response from SAP
   * @param {string} xmlResponse - Raw XML response
   * @returns {Promise<Object>} Parsed JSON object
   */
  async parseXmlResponse(xmlResponse) {
    try {
      const parser = new xml2js.Parser({ 
        explicitArray: false, 
        ignoreAttrs: false,
        tagNameProcessors: [xml2js.processors.stripPrefix] // Remove namespace prefixes
      });
      
      const result = await parser.parseStringPromise(xmlResponse);
      return result;
    } catch (error) {
      console.error(`[SAP-SOAP] XML parsing error:`, error.message);
      console.error(`[SAP-SOAP] Raw XML:`, xmlResponse);
      throw new Error(`Failed to parse XML response: ${error.message}`);
    }
  }

  /**
   * Creates XML for login validation
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {string} XML function call
   */
  createLoginXml(username, password) {
    return `<urn:ZFM_LOGIN_VALIDATE_RP_863>
    <IV_PASSWORD>${this.escapeXml(password)}</IV_PASSWORD>
    <IV_USERNAME>${this.escapeXml(username)}</IV_USERNAME>
</urn:ZFM_LOGIN_VALIDATE_RP_863>`;
  }

  /**
   * Creates XML for customer registration
   * @param {Object} userData - User registration data
   * @returns {string} XML function call
   */
  createRegistrationXml(userData) {
    return `<urn:ZFM_CUSTOMER_REGISTER_RP_863>
    <IV_CUSTOMER_MAIL>${this.escapeXml(userData.email)}</IV_CUSTOMER_MAIL>
    <IV_CUSTOMER_NAME>${this.escapeXml(userData.name)}</IV_CUSTOMER_NAME>
    <IV_CUSTOMER_NUMBER>${this.escapeXml(userData.customerNumber)}</IV_CUSTOMER_NUMBER>
    <IV_PASSWORD>${this.escapeXml(userData.password)}</IV_PASSWORD>
    <IV_USERNAME>${this.escapeXml(userData.username)}</IV_USERNAME>
</urn:ZFM_CUSTOMER_REGISTER_RP_863>`;
  }

  /**
   * Creates XML for customer profile
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createProfileXml(userId) {
    // Remove leading zeros for profile service (SAP test shows it expects '2' not '0000000002')
    const trimmedUserId = userId.replace(/^0+/, '') || '0';
    return `<urn:ZFM_CUSTOMER_PROFILE_RS_863>
    <IV_CUSTOMER_ID>${this.escapeXml(trimmedUserId)}</IV_CUSTOMER_ID>
</urn:ZFM_CUSTOMER_PROFILE_RS_863>`;
  }

  /**
   * Creates XML for customer inquiries
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createInquiriesXml(userId) {
    return `<urn:ZFM_CUST_INQUIRY_RP_863>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_CUST_INQUIRY_RP_863>`;
  }

  /**
   * Creates XML for sales orders
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createSalesOrdersXml(userId) {
    return `<urn:ZFM_SALEORDERS_RP_863>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_SALEORDERS_RP_863>`;
  }

  /**
   * Creates XML for deliveries
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createDeliveriesXml(userId) {
    return `<urn:ZFM_DELIVERY_LIST_RP_863>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_DELIVERY_LIST_RP_863>`;
  }

  /**
   * Creates XML for invoices
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createInvoicesXml(userId) {
    return `<urn:ZFM_INVOICE_DETAILS_RP_863>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_INVOICE_DETAILS_RP_863>`;
  }

  /**
   * Creates XML for credit/debit memos
   * @param {string} userId - User ID
   * @param {string} fromDate - From date (YYYY-MM-DD)
   * @param {string} toDate - To date (YYYY-MM-DD)
   * @returns {string} XML function call
   */
  createMemosXml(userId, fromDate, toDate) {
    return `<urn:ZFM_CDMEMO_RP_863>
    <IV_FROM_DATE>${this.escapeXml(fromDate)}</IV_FROM_DATE>
    <IV_TO_DATE>${this.escapeXml(toDate)}</IV_TO_DATE>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_CDMEMO_RP_863>`;
  }

  /**
   * Creates XML for aging detail
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createAgingDetailXml(userId) {
    return `<urn:ZFM_AGING_DETAIL_RP_863>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_AGING_DETAIL_RP_863>`;
  }

  /**
   * Creates XML for aging summary
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createAgingSummaryXml(userId) {
    return `<urn:ZFM_AGING_SUMMARY_RP_863>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_AGING_SUMMARY_RP_863>`;
  }

  /**
   * Creates XML for overall sales
   * @param {string} userId - User ID
   * @returns {string} XML function call
   */
  createOverallSalesXml(userId) {
    return `<urn:ZFM_OVERALLSALES_RP_863>
    <IV_USER_ID>${this.escapeXml(userId)}</IV_USER_ID>
</urn:ZFM_OVERALLSALES_RP_863>`;
  }

  /**
   * Creates XML for invoice PDF generation
   * @param {string} userId - User ID
   * @param {string} invoiceId - Invoice document number
   * @returns {string} XML function call
   */
  createInvoicePdfXml(userId, invoiceId) {
    return `<urn:ZFM_INVOICE_PDF_RP_863>
      <IV_INVOICE_NUMBER>${this.escapeXml(invoiceId)}</IV_INVOICE_NUMBER>
</urn:ZFM_INVOICE_PDF_RP_863>`;
  }

  /**
   * Escapes XML special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeXml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

module.exports = new SapSoapService();
