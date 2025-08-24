import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetInvoices(request, tenantContext) {
  try {
    const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);

    const response = await axios.get(`${baseUrl}/finance/invoices`, {
      headers,
      params: { pageSize: 1000 }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching invoices:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch invoices',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}

export const GET = withTenantAuth(handleGetInvoices);