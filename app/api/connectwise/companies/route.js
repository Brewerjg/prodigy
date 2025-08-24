import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetCompanies(request, tenantContext) {
  try {
    // Check if ConnectWise is configured for this tenant
    let config;
    try {
      config = await getTenantConnectWiseConfig(tenantContext.tenant.id);
    } catch (error) {
      console.log('ConnectWise not configured for tenant:', tenantContext.tenant.subdomain);
      return NextResponse.json([], { status: 200 }); // Return empty array if not configured
    }
    
    const { baseUrl, headers } = config;

    const url = `${baseUrl}/company/companies`;
    const params = { pageSize: 1000 };
    
    console.log('Fetching companies from:', url);
    console.log('Request params:', params);
    console.log('Headers clientId:', headers.clientId);
    
    const response = await axios.get(url, {
      headers,
      params
    });

    console.log('ConnectWise companies API response status:', response.status);
    console.log('Response data type:', typeof response.data, 'Is array:', Array.isArray(response.data));
    
    // Ensure we're returning an array
    const companies = Array.isArray(response.data) ? response.data : [];
    console.log(`Returning ${companies.length} companies`);
    
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error?.response?.data || error.message);
    const status = error.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch companies',
        details: error.message,
        response: error.response?.data
      },
      { status }
    );
  }
}

export const GET = withTenantAuth(handleGetCompanies);
