const express = require('express');
const jwt = require('jsonwebtoken');
const sapSoapService = require('../services/sap-soap.service');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates user with SAP using SOAP web service
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    console.log(`[AUTH] Login attempt for user: ${username}`);

    // Create XML payload for SAP login service
    const loginXml = sapSoapService.createLoginXml(username, password);

    // Call SAP SOAP service
    const sapResponse = await sapSoapService.callSapService('ZRFC_LOGIN_VALIDATE_863', loginXml);

    // Parse SAP response to determine success/failure
    console.log('[AUTH] Raw SAP response:', JSON.stringify(sapResponse, null, 2));
    const loginResult = parseSapLoginResponse(sapResponse);
    console.log('[AUTH] Parsed login result:', JSON.stringify(loginResult, null, 2));

    if (loginResult.success) {
      // Generate JWT token
      const token = jwt.sign(
        {
          USER_ID: loginResult.userId || username,
          username: username,
          role: loginResult.role || 'User'
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      console.log(`[AUTH] Login successful for user: ${username}`);

      res.json({
        success: true,
        token: token,
        user: {
          USER_ID: loginResult.userId || username,
          username: username,
          role: loginResult.role || 'User'
        },
        message: 'Login successful'
      });

    } else {
      console.log(`[AUTH] Login failed for user: ${username} - ${loginResult.message}`);
      
      res.status(401).json({
        success: false,
        error: loginResult.message || 'Invalid credentials'
      });
    }

  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    
    // Don't expose internal errors to client
    res.status(500).json({
      success: false,
      error: 'Authentication service temporarily unavailable. Please try again later.'
    });
  }
});

/**
 * POST /api/auth/register
 * Registers new user with SAP using SOAP web service
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, name, customerNumber } = req.body;

    // Validate input
    if (!username || !password || !email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, email, and name are required'
      });
    }

    console.log(`[AUTH] Registration attempt for user: ${username}`);

    // Create XML payload for SAP registration service
    const registrationXml = sapSoapService.createRegistrationXml({
      username,
      password,
      email,
      name,
      customerNumber: customerNumber || ''
    });

    // Call SAP SOAP service
    const sapResponse = await sapSoapService.callSapService('ZRFC_CUSTREG_863', registrationXml);

    // Parse SAP response
    const registrationResult = parseSapRegistrationResponse(sapResponse);

    if (registrationResult.success) {
      console.log(`[AUTH] Registration successful for user: ${username}`);
      
      res.json({
        success: true,
        message: 'Registration successful. You can now log in.',
        userId: registrationResult.userId
      });
    } else {
      console.log(`[AUTH] Registration failed for user: ${username} - ${registrationResult.message}`);
      
      res.status(400).json({
        success: false,
        error: registrationResult.message || 'Registration failed'
      });
    }

  } catch (error) {
    console.error('[AUTH] Registration error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Registration service temporarily unavailable. Please try again later.'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logs out user (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // by removing the token from localStorage
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Parses SAP login response to extract success/failure and user info
 * @param {Object} sapResponse - Parsed XML response from SAP
 * @returns {Object} Login result with success flag and user info
 */
function parseSapLoginResponse(sapResponse) {
  try {
    // Navigate through the SOAP response structure
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    // Look for the response element
    const loginResponse = body['ZFM_LOGIN_VALIDATE_RP_863Response'] || 
                         body['ZFM_LOGIN_VALIDATE_RP_863.Response'] ||
                         body.response;

    if (loginResponse) {
      // Extract success flag and user info
      const success = loginResponse.EV_SUCCESS === 'X' || 
                     loginResponse.EV_SUCCESS === true ||
                     loginResponse.SUCCESS === 'X' ||
                     loginResponse.SUCCESS === true;
      
      const userId = loginResponse.EV_USER_ID || loginResponse.EV_CUSTOMER_ID || loginResponse.USER_ID || loginResponse.CUSTOMER_ID;
      const role = loginResponse.EV_ROLE || loginResponse.ROLE || 'User';
      const message = loginResponse.EV_MESSAGE || loginResponse.MESSAGE;

      return {
        success: success,
        userId: userId,
        role: role,
        message: message
      };
    }

    // If we can't find the expected response structure, assume failure
    return {
      success: false,
      message: 'Invalid response format from authentication service'
    };

  } catch (error) {
    console.error('[AUTH] Error parsing SAP login response:', error.message);
    return {
      success: false,
      message: 'Error processing authentication response'
    };
  }
}

/**
 * Parses SAP registration response
 * @param {Object} sapResponse - Parsed XML response from SAP
 * @returns {Object} Registration result
 */
function parseSapRegistrationResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const registrationResponse = body['ZFM_CUSTOMER_REGISTER_RP_863Response'] || 
                                body['ZFM_CUSTOMER_REGISTER_RP_863.Response'] ||
                                body.response;

    if (registrationResponse) {
      const success = registrationResponse.EV_SUCCESS === 'X' || 
                     registrationResponse.EV_SUCCESS === true ||
                     registrationResponse.SUCCESS === 'X' ||
                     registrationResponse.SUCCESS === true;
      
      const userId = registrationResponse.EV_USER_ID || registrationResponse.USER_ID;
      const message = registrationResponse.EV_MESSAGE || registrationResponse.MESSAGE;

      return {
        success: success,
        userId: userId,
        message: message
      };
    }

    return {
      success: false,
      message: 'Invalid response format from registration service'
    };

  } catch (error) {
    console.error('[AUTH] Error parsing SAP registration response:', error.message);
    return {
      success: false,
      message: 'Error processing registration response'
    };
  }
}

module.exports = router;
