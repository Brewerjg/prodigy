import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../../../utils/tenantConnectWise.js';
import axios from 'axios';

async function handleGetCompanyInvoices(request, tenantContext, context) {
  const { companyId } = context.params;
  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
  }

  try {
    const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);
    const url = `${baseUrl}/finance/invoices?conditions=company/id=${companyId}&orderBy=id%20desc&pageSize=2`;
    const { data } = await axios.get(url, { headers });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching last two invoices:', err);
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: err.message },
      { status: err.response?.status || 500 }
    );
  }
}

export async function GET(request, context) {
  const handler = withTenantAuth((req, tenantContext) => 
    handleGetCompanyInvoices(req, tenantContext, context)
  );
  return handler(request);
}