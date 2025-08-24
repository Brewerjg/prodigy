import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetCompany(request, tenantContext, { params }) {
  try {
    const { id } = params;
    const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);

    const response = await axios.get(`${baseUrl}/company/companies/${id}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching company details:', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    return NextResponse.json(
      {
        error: 'Failed to fetch company details',
        details: error.message,
        response: error?.response?.data
      },
      { status }
    );
  }
}

export async function GET(request, context) {
  const handler = withTenantAuth((req, tenantContext) => 
    handleGetCompany(req, tenantContext, context)
  );
  return handler(request);
}
