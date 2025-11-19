const express = require('express');
const sapSoapService = require('../services/sap-soap.service');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/profile
 * Get customer profile from SAP
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[PROFILE] Fetching profile for user: ${userId}`);

    // Create XML payload for SAP profile service
    const profileXml = sapSoapService.createProfileXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_CUSTOMER_PROFILE_863', profileXml);
    const profile = parseProfileResponse(sapResponse);

    if (profile) {
      res.json({
        success: true,
        profile: profile,
        message: 'Profile retrieved successfully.'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Profile not found for this customer.'
      });
    }

  } catch (error) {
    console.error('[PROFILE] Error fetching profile from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile from SAP. Please try again later.'
    });
  }
});

/**
 * PUT /api/profile
 * Update customer profile in SAP
 * Note: This is a stub - actual update service may not be available
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    const { email, phone } = req.body;

    console.log(`[PROFILE] Update request for user: ${userId}`);

    // Validate email format
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate phone length
    if (phone && (phone.length < 10 || phone.length > 20)) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must be between 10 and 20 characters'
      });
    }

    // For now, return 501 Not Implemented
    // When SAP update service is available, implement the SOAP call here
    res.status(501).json({
      success: false,
      error: 'Profile update is not yet implemented. This feature is coming soon.'
    });

  } catch (error) {
    console.error('[PROFILE] Error updating profile:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile. Please try again later.'
    });
  }
});

/**
 * Parse profile response from SAP
 */
/**
 * Parse profile response from SAP
 * Based on ZRFC_CUSTOMER_PROFILE_863 ABAP function module
 * 
 * ABAP Structure (ES_CUSTPROF):
 * - KUNNR: Customer number from KNA1
 * - ADRNR: Address number from KNA1
 * - NAME1: Customer name from KNA1
 * - CUSTOMER_MAIL: Email from ZCUST_LOGIN_863 table
 * - CITY1: City from KNA1 (ORT01 field)
 * - COUNTRY: Country from KNA1 (LAND1 field)
 */
function parseProfileResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZRFC_CUSTOMER_PROFILE_863Response'] || body['ZFM_CUSTOMER_PROFILE_RS_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ES_CUSTPROF) {
      const customer = response.ES_CUSTPROF;
      
      return {
        customerId: customer.KUNNR || '',
        addressNumber: customer.ADRNR || '',
        name: customer.NAME1 || '',
        email: customer.CUSTOMER_MAIL || '',  // Changed from SMTP_ADDR
        city: customer.CITY1 || '',            // Already correct
        country: customer.COUNTRY || ''        // Changed from LAND1
      };
    }

    return null;
  } catch (error) {
    console.error('[PROFILE] Error parsing profile response:', error.message);
    return null;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = router;
