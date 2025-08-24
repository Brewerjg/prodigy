import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../../../utils/tenantConnectWise.js';

import axios from 'axios';

async function handleGetTicketNotes(request, tenantContext, context) {
  try {
    const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);
    const { id } = context.params;

    // Fetch ticket notes from ConnectWise API
    const response = await axios.get(`${baseUrl}/service/tickets/${id}/notes`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching ticket notes:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch ticket notes',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}

export async function GET(request, context) {
  const handler = withTenantAuth((req, tenantContext) => 
    handleGetTicketNotes(req, tenantContext, context)
  );
  return handler(request);
}