import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../../utils/tenantConnectWise.js';

import axios from 'axios';

async function handleGetInvoice(request, tenantContext, { params }) {
  try {
    const { id } = params;
    const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);

    const response = await axios.get(`${baseUrl}/finance/invoices/${id}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching invoice:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch invoice',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
} 

export async function GET(request, context) {
  const handler = withTenantAuth((req, tenantContext) => 
    handleGetInvoice(req, tenantContext, context)
  );
  return handler(request);
}