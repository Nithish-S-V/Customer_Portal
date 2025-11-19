const soap = require('soap');
const xml2js = require('xml2js');

// Cache for SOAP clients to improve performance
const clientCache = new Map();
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Creates a SOAP client for the specified SAP service
 * @param {string} serviceName - Name of the SAP SOAP service (e.g., 'ZRFC_LOGIN_VALIDATE_863')
 * @returns {Promise<Object>} SOAP client instance
 */
async function createSoapClient(serviceName) {
  const cacheKey = serviceName;
  
  // Check if client is cached and not expired
  if (clientCache.has(cacheKey)) {
    const cached = clientCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log(`[SOAP] Using cached client for ${serviceName}`);
      return cached.client;
    } else {
      // Remove expired cache entry
      clientCache.delete(cacheKey);
    }
  }

  // Construct WSDL URL
  const wsdlUrl = `${process.env.SAP_BASE_URL}/${serviceName}?sap-client=${process.env.SAP_CLIENT}&wsdl`;
  
  console.log(`[SOAP] Creating new client for ${serviceName}`);
  console.log(`[SOAP] WSDL URL: ${wsdlUrl}`);

  try {
    // Create SOAP client with basic authentication
    const client = await soap.createClientAsync(wsdlUrl, {
      wsdl_options: {
        timeout: 30000, // 30 seconds timeout
      },
      // Basic authentication for SAP
      wsdl_headers: {
        Authorization: 'Basic ' + Buffer.from(`${process.env.SAP_USER}:${process.env.SAP_PASSWORD}`).toString('base64')
      }
    });

    // Add basic auth to client
    client.setSecurity(new soap.BasicAuthSecurity(process.env.SAP_USER, process.env.SAP_PASSWORD));

    // Cache the client
    clientCache.set(cacheKey, {
      client,
      timestamp: Date.now()
    });

    console.log(`[SOAP] Client created successfully for ${serviceName}`);
    return client;

  } catch (error) {
    console.error(`[SOAP] Error creating client for ${serviceName}:`, error.message);
    throw new Error(`Failed to create SOAP client: ${error.message}`);
  }
}

/**
 * Calls a SOAP service method and returns JSON response
 * @param {string} serviceName - Name of the SAP SOAP service
 * @param {string} methodName - Name of the method to call (usually 'Execute' or service-specific)
 * @param {Object} parameters - Parameters to pass to the SOAP method
 * @returns {Promise<Object>} JSON response from SAP
 */
async function callSoapService(serviceName, methodName, parameters = {}) {
  const startTime = Date.now();
  
  try {
    console.log(`[SOAP] Calling ${serviceName}.${methodName}`);
    console.log(`[SOAP] Parameters:`, JSON.stringify(parameters, null, 2));

    // Create SOAP client
    const client = await createSoapClient(serviceName);

    // Get the method from client
    if (!client[methodName]) {
      throw new Error(`Method ${methodName} not found in service ${serviceName}`);
    }

    // Call the SOAP method
    const [result] = await client[methodName + 'Async'](parameters);

    const duration = Date.now() - startTime;
    console.log(`[SOAP] Call completed in ${duration}ms`);
    console.log(`[SOAP] Response:`, JSON.stringify(result, null, 2));

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[SOAP] Error calling ${serviceName}.${methodName} (${duration}ms):`, error.message);
    
    // Check if it's a SOAP fault
    if (error.root && error.root.Envelope && error.root.Envelope.Body && error.root.Envelope.Body.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      throw new Error(`SOAP Fault: ${fault.faultstring || fault.faultcode}`);
    }
    
    throw error;
  }
}

/**
 * Parses XML string to JSON
 * @param {string} xml - XML string to parse
 * @returns {Promise<Object>} Parsed JSON object
 */
async function parseXmlToJson(xml) {
  const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
  return parser.parseStringPromise(xml);
}

/**
 * Clears the SOAP client cache
 */
function clearCache() {
  clientCache.clear();
  console.log('[SOAP] Client cache cleared');
}

module.exports = {
  createSoapClient,
  callSoapService,
  parseXmlToJson,
  clearCache
};
