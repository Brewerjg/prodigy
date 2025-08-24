import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetTicketDocuments(request, tenantContext, context) {
  try {
    const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);
    const { id } = context.params;

    // Fetch ticket documents/attachments from ConnectWise API
    const response = await axios.get(`${baseUrl}/system/documents?recordType=Ticket&recordId=${id}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching ticket documents:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch ticket documents',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}

export async function GET(request, context) {
  const handler = withTenantAuth((req, tenantContext) => 
    handleGetTicketDocuments(req, tenantContext, context)
  );
  return handler(request);
}