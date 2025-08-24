import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetInvoices(request, tenantContext) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    // Check if ConnectWise is configured for this tenant
    let config;
    try {
      config = await getTenantConnectWiseConfig(tenantContext.tenant.id);
    } catch (error) {
      console.log('ConnectWise not configured for tenant:', tenantContext.tenant.subdomain);
      return NextResponse.json([], { status: 200 }); // Return empty array if not configured
    }
    
    const { baseUrl, headers } = config;

    console.log('Fetching invoices for customer:', customerId);

    const response = await axios.get(`${baseUrl}/finance/invoices`, {
      headers,
      params: {
        pageSize: 1000,
        conditions: customerId ? `company/id = ${customerId}` : undefined
      }
    });

    console.log('ConnectWise API response:', response.data);

    // Ensure we're returning an array
    const invoices = Array.isArray(response.data) ? response.data : [];
    
    return NextResponse.json(invoices);
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