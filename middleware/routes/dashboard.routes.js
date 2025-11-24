const express = require('express');
const sapSoapService = require('../services/sap-soap.service');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/dashboard/summary
 * Get dashboard summary counts from SAP
 */
router.get('/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[DASHBOARD] Fetching summary for user: ${userId}`);

    // Call all endpoints in parallel
    const [inquiriesXml, salesOrdersXml, deliveriesXml, invoicesXml, overallSalesXml] = [
      sapSoapService.createInquiriesXml(userId),
      sapSoapService.createSalesOrdersXml(userId),
      sapSoapService.createDeliveriesXml(userId),
      sapSoapService.createInvoicesXml(userId),
      sapSoapService.createOverallSalesXml(userId)
    ];

    const [inquiriesRes, salesOrdersRes, deliveriesRes, invoicesRes, overallSalesRes] = await Promise.all([
      sapSoapService.callSapService('ZRFC_CUST_INQUIRY_863', inquiriesXml).catch(() => ({ success: false })),
      sapSoapService.callSapService('ZRFC_SALEORDERS_863', salesOrdersXml).catch(() => ({ success: false })),
      sapSoapService.callSapService('ZRFC_DELIVERY_LIST_863', deliveriesXml).catch(() => ({ success: false })),
      sapSoapService.callSapService('ZRFC_INVOICE_DETAILS_863', invoicesXml).catch(() => ({ success: false })),
      sapSoapService.callSapService('ZRFC_OVERALLSALES_863', overallSalesXml).catch(() => ({ success: false }))
    ]);

    const summary = {
      totalInquiries: parseInquiriesResponse(inquiriesRes).length,
      totalSalesOrders: parseSalesOrdersResponse(salesOrdersRes).length,
      totalDeliveries: parseDeliveriesResponse(deliveriesRes).length,
      totalInvoices: parseInvoicesResponse(invoicesRes).length,
      totalOverallSales: parseOverallSalesResponse(overallSalesRes).length
    };

    res.json({
      success: true,
      summary: summary,
      message: 'Dashboard summary retrieved successfully.'
    });

  } catch (error) {
    console.error('[DASHBOARD] Error fetching summary from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/inquiries
 * Get customer inquiries from SAP
 */
router.get('/inquiries', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[DASHBOARD] Fetching inquiries for user: ${userId}`);

    // Create XML payload for SAP inquiry service
    const inquiriesXml = sapSoapService.createInquiriesXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_CUST_INQUIRY_863', inquiriesXml);
    const inquiries = parseInquiriesResponse(sapResponse);

    res.json({
      success: true,
      inquiries: inquiries,
      message: inquiries.length === 0 ? 'No inquiries found for this customer.' : 'Inquiries retrieved successfully.'
    });

  } catch (error) {
    console.error('[DASHBOARD] Error fetching inquiries from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/salesorders
 * Get customer sales orders from SAP
 */
router.get('/salesorders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[DASHBOARD] Fetching sales orders for user: ${userId}`);

    // Create XML payload for SAP sales orders service
    const salesOrdersXml = sapSoapService.createSalesOrdersXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_SALEORDERS_863', salesOrdersXml);
    const salesOrders = parseSalesOrdersResponse(sapResponse);

    res.json({
      success: true,
      salesOrders: salesOrders,
      message: salesOrders.length === 0 ? 'No sales orders found for this customer.' : 'Sales orders retrieved successfully.'
    });

  } catch (error) {
    console.error('[DASHBOARD] Error fetching sales orders from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales orders from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/salesorders/:id
 * Get specific sales order details from SAP
 */
router.get('/salesorders/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    const orderId = req.params.id;
    console.log(`[DASHBOARD] Fetching sales order details for: ${orderId}, user: ${userId}`);

    // Create XML payload for SAP sales orders service
    const salesOrdersXml = sapSoapService.createSalesOrdersXml(userId);

    // Call SAP service and filter for specific order
    const sapResponse = await sapSoapService.callSapService('ZRFC_SALEORDERS_863', salesOrdersXml);
    const salesOrders = parseSalesOrdersResponse(sapResponse);
    
    // Find the specific sales order
    const salesOrder = salesOrders.find(o => o.orderNumber === orderId);

    if (salesOrder) {
      res.json({
        success: true,
        salesOrder: salesOrder,
        message: 'Sales order details retrieved successfully.'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Sales order not found.'
      });
    }

  } catch (error) {
    console.error('[DASHBOARD] Error fetching sales order details from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales order details from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/deliveries
 * Get customer deliveries from SAP
 */
router.get('/deliveries', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[DASHBOARD] Fetching deliveries for user: ${userId}`);

    // Create XML payload for SAP deliveries service
    const deliveriesXml = sapSoapService.createDeliveriesXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_DELIVERY_LIST_863', deliveriesXml);
    const deliveries = parseDeliveriesResponse(sapResponse);

    res.json({
      success: true,
      deliveries: deliveries,
      message: deliveries.length === 0 ? 'No deliveries found for this customer.' : 'Deliveries retrieved successfully.'
    });

  } catch (error) {
    console.error('[DASHBOARD] Error fetching deliveries from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deliveries from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/deliveries/:id
 * Get specific delivery details from SAP
 */
router.get('/deliveries/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    const deliveryId = req.params.id;
    console.log(`[DASHBOARD] Fetching delivery details for: ${deliveryId}, user: ${userId}`);

    // Create XML payload for SAP deliveries service
    const deliveriesXml = sapSoapService.createDeliveriesXml(userId);

    // Call SAP service and filter for specific delivery
    const sapResponse = await sapSoapService.callSapService('ZRFC_DELIVERY_LIST_863', deliveriesXml);
    const deliveries = parseDeliveriesResponse(sapResponse);
    
    // Find the specific delivery
    const delivery = deliveries.find(d => d.deliveryNumber === deliveryId);

    if (delivery) {
      res.json({
        success: true,
        delivery: delivery,
        message: 'Delivery details retrieved successfully.'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Delivery not found.'
      });
    }

  } catch (error) {
    console.error('[DASHBOARD] Error fetching delivery details from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery details from SAP. Please try again later.'
    });
  }
});

/**
 * Parse inquiries response from SAP
 */
function parseInquiriesResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_CUST_INQUIRY_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_INQUIRIES) {
      // ET_INQUIRIES contains an 'item' array
      const items = response.ET_INQUIRIES.item || [];
      const inquiryArray = Array.isArray(items) ? items : [items];
      
      return inquiryArray.map(inquiry => ({
        inquiryNumber: inquiry.VBELN || '',
        productCode: inquiry.MATNR || '',
        productDescription: inquiry.ARKTX || '',
        amount: parseFloat(inquiry.NETWR) || 0,
        currency: inquiry.WAERK || 'EUR',
        unit: inquiry.VRKME || '',
        validFrom: inquiry.ANGDT || '',
        validTo: inquiry.BNDDT || '',
        createdDate: inquiry.ERDAT || '',
        createdBy: inquiry.ERNAM || '',
        documentType: inquiry.AUART || '',
        itemNumber: inquiry.POSNR || ''
      }));
    }

    return [];
  } catch (error) {
    console.error('[DASHBOARD] Error parsing inquiries response:', error.message);
    return [];
  }
}

/**
 * Parse sales orders response from SAP
 * Based on ZFM_SALEORDERS_RP_863 ABAP function module
 */
function parseSalesOrdersResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_SALEORDERS_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_SALESORDERS) {
      const items = response.ET_SALESORDERS.item || [];
      const ordersArray = Array.isArray(items) ? items : [items];
      
      return ordersArray.map(order => ({
        orderNumber: (order.VBELN || '').replace(/^0+/, ''),
        orderDate: order.ERDAT || '',
        createdBy: order.ERNAM || '',
        documentType: order.AUART || '',
        productCode: (order.MATNR || '').replace(/^0+/, ''),
        productDescription: order.ARKTX || '',
        itemNumber: order.POSNR || '',
        amount: parseFloat(order.NETWR) || 0,
        currency: order.WAERK || 'EUR',
        status: 'Open' // Default status, can be enhanced based on business logic
      }));
    }

    return [];
  } catch (error) {
    console.error('[DASHBOARD] Error parsing sales orders response:', error.message);
    return [];
  }
}

/**
 * Parse deliveries response from SAP
 * Based on ZFM_DELIVERY_LIST_RP_863 ABAP function module
 */
function parseDeliveriesResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_DELIVERY_LIST_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_DELIVERIES) {
      const items = response.ET_DELIVERIES.item || [];
      const deliveriesArray = Array.isArray(items) ? items : [items];
      
      return deliveriesArray.map(delivery => ({
        deliveryNumber: (delivery.VBELN || '').replace(/^0+/, ''),
        customerNumber: (delivery.KUNNR || '').replace(/^0+/, ''),
        shippingPoint: delivery.VSTEL || '',
        createdBy: delivery.ERNAM || '',
        createdDate: delivery.ERDAT || '',
        itemNumber: delivery.POSNR || '',
        productCode: (delivery.MATNR || '').replace(/^0+/, ''),
        productDescription: delivery.ARKTX || '',
        deliveryQuantity: parseFloat(delivery.LFIMG) || 0,
        unit: delivery.VRKME || '',
        status: 'Delivered' // Default status, can be enhanced based on business logic
      }));
    }

    return [];
  } catch (error) {
    console.error('[DASHBOARD] Error parsing deliveries response:', error.message);
    return [];
  }
}

/**
 * Parse invoices response from SAP
 */
function parseInvoicesResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_INVOICE_DETAILS_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_INVOICES) {
      const items = response.ET_INVOICES.item || [];
      return Array.isArray(items) ? items : [items];
    }

    return [];
  } catch (error) {
    console.error('[DASHBOARD] Error parsing invoices response:', error.message);
    return [];
  }
}

/**
 * Parse overall sales response from SAP
 */
function parseOverallSalesResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_OVERALLSALES_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_OVERALLSALES) {
      const items = response.ET_OVERALLSALES.item || [];
      return Array.isArray(items) ? items : [items];
    }

    return [];
  } catch (error) {
    console.error('[DASHBOARD] Error parsing overall sales response:', error.message);
    return [];
  }
}

module.exports = router;
