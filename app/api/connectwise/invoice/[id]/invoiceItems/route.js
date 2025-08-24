import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetInvoiceItems(request, tenantContext, context) {
  const { id } = context.params;
  try {
    const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);

    const response = await axios.get(`${baseUrl}/procurement/products?conditions=invoice/id=${id}`, { headers });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching invoice items:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch invoice items',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}

export async function GET(request, context) {
  const handler = withTenantAuth((req, tenantContext) => 
    handleGetInvoiceItems(req, tenantContext, context)
  );
  return handler(request);
}