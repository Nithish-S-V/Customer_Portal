const express = require('express');
const sapSoapService = require('../services/sap-soap.service');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/invoices
 * Get customer invoices from SAP
 */
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[FINANCIAL] Fetching invoices for user: ${userId}`);

    // Create XML payload for SAP invoice service
    const invoicesXml = sapSoapService.createInvoicesXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_INVOICE_DETAILS_863', invoicesXml);
    const invoices = parseInvoicesResponse(sapResponse);

    res.json({
      success: true,
      invoices: invoices,
      message: invoices.length === 0 ? 'No invoices found for this customer.' : 'Invoices retrieved successfully.'
    });

  } catch (error) {
    console.error('[FINANCIAL] Error fetching invoices from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/memos
 * Get credit/debit memos from SAP
 * Query params: fromDate, toDate (optional)
 */
router.get('/memos', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    const fromDate = req.query.fromDate || '2020-01-01';
    const toDate = req.query.toDate || new Date().toISOString().split('T')[0];
    
    console.log(`[FINANCIAL] Fetching memos for user: ${userId}, from: ${fromDate}, to: ${toDate}`);

    // Create XML payload for SAP memos service
    const memosXml = sapSoapService.createMemosXml(userId, fromDate, toDate);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_CDMEMO_863', memosXml);
    const memos = parseMemosResponse(sapResponse);

    res.json({
      success: true,
      memos: memos,
      message: memos.length === 0 ? 'No credit/debit memos found for this customer.' : 'Memos retrieved successfully.'
    });

  } catch (error) {
    console.error('[FINANCIAL] Error fetching memos from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit/debit memos from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/aging/detail
 * Get detailed aging report from SAP
 */
router.get('/aging/detail', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[FINANCIAL] Fetching aging detail for user: ${userId}`);

    // Create XML payload for SAP aging detail service
    const agingDetailXml = sapSoapService.createAgingDetailXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_AGING_DETAIL_863', agingDetailXml);
    const agingDetail = parseAgingDetailResponse(sapResponse);

    res.json({
      success: true,
      agingDetail: agingDetail,
      message: agingDetail.length === 0 ? 'No aging details found for this customer.' : 'Aging detail retrieved successfully.'
    });

  } catch (error) {
    console.error('[FINANCIAL] Error fetching aging detail from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aging detail from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/aging/summary
 * Get aging summary report from SAP
 */
router.get('/aging/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[FINANCIAL] Fetching aging summary for user: ${userId}`);

    // Create XML payload for SAP aging summary service
    const agingSummaryXml = sapSoapService.createAgingSummaryXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_AGING_SUMMARY_863', agingSummaryXml);
    const agingSummary = parseAgingSummaryResponse(sapResponse);

    res.json({
      success: true,
      agingSummary: agingSummary,
      message: 'Aging summary retrieved successfully.'
    });

  } catch (error) {
    console.error('[FINANCIAL] Error fetching aging summary from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aging summary from SAP. Please try again later.'
    });
  }
});

/**
 * GET /api/invoice/:id/pdf
 * Get invoice PDF from SAP
 */
router.get('/invoice/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = req.user.USER_ID;
    console.log(`[FINANCIAL-PDF] Starting PDF generation for invoice: ${invoiceId}, user: ${userId}`);

    // Create XML payload for SAP invoice PDF service
    console.log('[FINANCIAL-PDF] Creating XML payload...');
    const pdfXml = sapSoapService.createInvoicePdfXml(userId, invoiceId);
    console.log('[FINANCIAL-PDF] XML payload created:', pdfXml);

    // Call SAP service
    console.log('[FINANCIAL-PDF] Calling SAP service ZRFC_INVOICE_PDF_863...');
    const sapResponse = await sapSoapService.callSapService('ZRFC_INVOICE_PDF_863', pdfXml);
    console.log('[FINANCIAL-PDF] SAP response received');
    
    // Extract the Base64 PDF string from response
    // Note: Service name is ZRFC_INVOICE_PDF_863 but response uses ZFM_INVOICE_PDF_RP_863Response
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    const response = body['ZFM_INVOICE_PDF_RP_863Response'];

    console.log('[FINANCIAL-PDF] Response structure:', {
      hasEnvelope: !!envelope,
      hasBody: !!body,
      hasResponse: !!response,
      responseKeys: response ? Object.keys(response) : []
    });

    if (response && response.EV_SUCCESS === 'X' && response.EV_PDF_BASE64) {
      const base64Pdf = response.EV_PDF_BASE64;
      console.log(`[FINANCIAL-PDF] Base64 PDF received, length: ${base64Pdf.length}`);
      
      // Decode Base64 to binary buffer
      const pdfBuffer = Buffer.from(base64Pdf, 'base64');
      console.log(`[FINANCIAL-PDF] PDF buffer created, size: ${pdfBuffer.length} bytes`);
      
      // Set headers for PDF download/display
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="invoice_${invoiceId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      console.log('[FINANCIAL-PDF] Sending PDF to client...');
      // Send the PDF buffer
      res.send(pdfBuffer);
      console.log('[FINANCIAL-PDF] PDF sent successfully');
    } else {
      console.error('[FINANCIAL-PDF] SAP did not return PDF data');
      console.error('[FINANCIAL-PDF] Response details:', JSON.stringify(response, null, 2));
      res.status(404).json({
        success: false,
        error: 'Invoice PDF not found or could not be generated.',
        details: response ? {
          success: response.EV_SUCCESS,
          message: response.EV_MESSAGE || 'No message provided'
        } : 'No response from SAP'
      });
    }

  } catch (error) {
    console.error('[FINANCIAL-PDF] Error fetching invoice PDF from SAP:', error.message);
    console.error('[FINANCIAL-PDF] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice PDF from SAP. Please try again later.',
      details: error.message
    });
  }
});

/**
 * GET /api/sales/overall
 * Get overall sales data from SAP
 */
router.get('/sales/overall', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.USER_ID;
    console.log(`[FINANCIAL] Fetching overall sales for user: ${userId}`);

    // Create XML payload for SAP overall sales service
    const overallSalesXml = sapSoapService.createOverallSalesXml(userId);

    // Call SAP service - no fallback, fail if SAP is unavailable
    const sapResponse = await sapSoapService.callSapService('ZRFC_OVERALLSALES_863', overallSalesXml);
    const overallSales = parseOverallSalesResponse(sapResponse);

    res.json({
      success: true,
      overallSales: overallSales,
      message: 'Overall sales retrieved successfully.'
    });

  } catch (error) {
    console.error('[FINANCIAL] Error fetching overall sales from SAP:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overall sales from SAP. Please try again later.'
    });
  }
});

/**
 * Parse invoices response from SAP
 * Based on ZFM_INVOICE_DETAILS_RP_863 ABAP function module
 * Returns array matching Master API Specification (camelCase)
 */
function parseInvoicesResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_INVOICE_DETAILS_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_INVOICES) {
      const items = response.ET_INVOICES.item || [];
      const invoicesArray = Array.isArray(items) ? items : [items];
      
      // Transform to Master API Specification format (camelCase)
      return invoicesArray.map(item => ({
        itemNumber: item.ITEM_NO || '',
        documentNumber: item.DOCUMENT_NO || '',
        billingDate: item.BILL_DATE || '',
        customerName: item.CUSTOMERNAME || '',
        materialNumber: item.MAT_NO || '',
        materialDescription: item.MAT_DES || '',
        netValue: parseFloat(item.NETWR) || 0,
        currency: item.CURRENCY || 'EUR'
      }));
    }

    return [];
  } catch (error) {
    console.error('[FINANCIAL] Error parsing invoices response:', error.message);
    return [];
  }
}

/**
 * Parse memos response from SAP
 * Based on ZFM_CDMEMO_RP_863 ABAP function module
 * Returns both header and item data combined
 */
function parseMemosResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_CDMEMO_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X') {
      const headers = response.ET_CDMEMO_HEAD?.item || [];
      const items = response.ET_CDMEMO_ITEM?.item || [];
      
      const headersArray = Array.isArray(headers) ? headers : [headers];
      const itemsArray = Array.isArray(items) ? items : [items];
      
      // Combine headers with their items
      return headersArray.map(header => ({
        documentNumber: header.DOCUMENT_NUMBER || '',
        documentType: header.DOCUMENT_TYPE || '',
        documentTypeText: header.DOCUMENT_TYPE_TEXT || '',
        reference: header.REFERENCE || '',
        customerNumber: header.CUSTOMER_NUMBER || '',
        customerName: header.CUSTOMER_NAME || '',
        billingDate: header.BILLING_DATE || '',
        creationDate: header.CREATION_DATE || '',
        createdBy: header.CREATED_BY || '',
        currency: header.CURRENCY || 'EUR',
        netValue: parseFloat(header.NET_VALUE) || 0,
        taxAmount: parseFloat(header.TAX_AMOUNT) || 0,
        salesOrg: header.SALES_ORG || '',
        items: itemsArray
          .filter(item => item.DOCUMENT_NUMBER === header.DOCUMENT_NUMBER)
          .map(item => ({
            itemNumber: item.ITEM_NUMBER || '',
            materialNumber: item.MATERIAL_NUMBER || '',
            materialDescription: item.MATERIAL_DESCRIPTION || '',
            billedQuantity: parseFloat(item.BILLED_QUANTITY) || 0,
            unitOfMeasure: item.UNIT_OF_MEASURE || '',
            netValue: parseFloat(item.NET_VALUE) || 0
          }))
      }));
    }

    return [];
  } catch (error) {
    console.error('[FINANCIAL] Error parsing memos response:', error.message);
    return [];
  }
}

/**
 * Parse aging detail response from SAP
 * Based on ZFM_AGING_DETAIL_RP_863 ABAP function module
 */
function parseAgingDetailResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_AGING_DETAIL_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_AGING_DETAIL) {
      const items = response.ET_AGING_DETAIL.item || [];
      const detailsArray = Array.isArray(items) ? items : [items];
      
      return detailsArray.map(detail => ({
        invoiceNumber: detail.INVOICE_NUMBER || '',
        billingDate: detail.BILLING_DATE || '',
        dueDate: detail.DUE_DATE || '',
        amountDue: parseFloat(detail.AMOUNT_DUE) || 0,
        currency: detail.CURRENCY || 'EUR',
        daysOverdue: parseInt(detail.DAYS_OVERDUE) || 0,
        agingBucket: detail.DAYS_OVERDUE > 90 ? '90+ Days' : 
                     detail.DAYS_OVERDUE > 60 ? '61-90 Days' :
                     detail.DAYS_OVERDUE > 30 ? '31-60 Days' :
                     detail.DAYS_OVERDUE > 0 ? '1-30 Days' : 'Current'
      }));
    }

    return [];
  } catch (error) {
    console.error('[FINANCIAL] Error parsing aging detail response:', error.message);
    return [];
  }
}

/**
 * Parse aging summary response from SAP
 * Based on ZFM_AGING_SUMMARY_RP_863 ABAP function module
 */
function parseAgingSummaryResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_AGING_SUMMARY_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_AGING_SUMMARY) {
      const items = response.ET_AGING_SUMMARY.item || [];
      const summaryArray = Array.isArray(items) ? items : [items];
      
      // The ABAP returns one summary row with all buckets
      if (summaryArray.length > 0) {
        const summary = summaryArray[0];
        return {
          days_0_30: parseFloat(summary.DAYS_0_30) || 0,
          days_31_60: parseFloat(summary.DAYS_31_60) || 0,
          days_61_90: parseFloat(summary.DAYS_61_90) || 0,
          days_91_plus: parseFloat(summary.DAYS_91_PLUS) || 0,
          total_due: parseFloat(summary.TOTAL_DUE) || 0,
          currency: summary.CURRENCY || 'EUR'
        };
      }
    }

    return {
      days_0_30: 0,
      days_31_60: 0,
      days_61_90: 0,
      days_91_plus: 0,
      total_due: 0,
      currency: 'EUR'
    };
  } catch (error) {
    console.error('[FINANCIAL] Error parsing aging summary response:', error.message);
    return {};
  }
}

/**
 * Parse overall sales response from SAP
 * Based on ZFM_OVERALLSALES_RP_863 ABAP function module
 * Returns array of sales records (both orders and billing)
 */
function parseOverallSalesResponse(sapResponse) {
  try {
    const envelope = sapResponse.Envelope || sapResponse;
    const body = envelope.Body || envelope.body;
    
    const response = body['ZFM_OVERALLSALES_RP_863Response'];

    if (response && response.EV_SUCCESS === 'X' && response.ET_OVERALL_SALES) {
      const items = response.ET_OVERALL_SALES.item || [];
      const salesArray = Array.isArray(items) ? items : [items];
      
      return salesArray.map(sale => ({
        documentNumber: sale.DOCUMENT_NUMBER || '',
        recordType: sale.RECORD_TYPE || '',
        materialNumber: sale.MATERIAL_NUMBER || '',
        materialDescription: sale.MATERIAL_DESCRIPTION || '',
        netValue: parseFloat(sale.NET_VALUE) || 0,
        currency: sale.CURRENCY || 'EUR',
        creationDate: sale.CREATION_DATE || '',
        billingDate: sale.BILLING_DATE || '',
        totalOrdersValue: parseFloat(sale.TOTAL_ORDERS_VALUE) || 0,
        totalBilledValue: parseFloat(sale.TOTAL_BILLED_VALUE) || 0
      }));
    }

    return [];
  } catch (error) {
    console.error('[FINANCIAL] Error parsing overall sales response:', error.message);
    return [];
  }
}

module.exports = router;
