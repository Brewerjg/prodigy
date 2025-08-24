import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetTickets(request, tenantContext) {
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
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const pageSize = searchParams.get('pageSize') || '1000'; // Default to 1000 for dashboard stats
    const includeAll = searchParams.get('includeAll') === 'true';
    const companyId = searchParams.get('companyId');
    
    // Build API parameters
    const params = {
      pageSize: parseInt(pageSize),
      orderBy: 'dateEntered desc'
    };
    
    // Add conditions based on parameters
    const conditions = [];
    
    // If not includeAll, exclude closed tickets (for live ticker)
    if (!includeAll) {
      conditions.push('status/name != "Closed"');
    }
    
    // Filter by company if specified
    if (companyId) {
      conditions.push(`company/id = ${companyId}`);
    }
    
    // Add conditions to params if any exist
    if (conditions.length > 0) {
      params.conditions = conditions.join(' AND ');
    }

    // Fetch tickets from ConnectWise API
    const url = `${baseUrl}/service/tickets`;
    console.log('Fetching tickets from:', url);
    console.log('Request params:', params);
    console.log('Headers clientId:', headers.clientId);
    
    const response = await axios.get(url, {
      headers,
      params
    });

    console.log('ConnectWise API response status:', response.status);
    console.log('Response data type:', typeof response.data, 'Is array:', Array.isArray(response.data));
    
    // Ensure we're returning an array
    const tickets = Array.isArray(response.data) ? response.data : [];
    console.log(`Returning ${tickets.length} tickets`);
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch tickets',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}

export const GET = withTenantAuth(handleGetTickets);