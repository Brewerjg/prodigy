import { NextResponse } from 'next/server';
import { withTenantAuth, requireRole } from '../../../../lib/middleware/tenantMiddleware.js';
import tenantService from '../../../../lib/tenantService.js';

async function handleGetConfig(request, tenantContext) {
  try {
    const credentials = await tenantService.getDecryptedConnectWiseCredentials(
      tenantContext.tenant.id
    );

    // Return config for ConnectWise API calls
    return NextResponse.json({
      success: true,
      config: {
        baseUrl: credentials.site_url,
        clientId: credentials.client_id,
        publicKey: credentials.public_key,
        privateKey: credentials.private_key,
        companyId: credentials.company_id
      }
    });

  } catch (error) {
    console.error('Failed to get ConnectWise config:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ConnectWise configuration' },
      { status: 500 }
    );
  }
}

async function handleUpdateConfig(request, tenantContext) {
  try {
    const { site_url, client_id, public_key, private_key, company_id } = await request.json();

    await tenantService.updateConnectWiseCredentials(tenantContext.tenant.id, {
      site_url,
      client_id,
      public_key,
      private_key,
      company_id
    });

    return NextResponse.json({
      success: true,
      message: 'ConnectWise configuration updated successfully'
    });

  } catch (error) {
    console.error('Failed to update ConnectWise config:', error);
    return NextResponse.json(
      { error: 'Failed to update ConnectWise configuration' },
      { status: 500 }
    );
  }
}

export const GET = withTenantAuth(handleGetConfig);

export const PUT = withTenantAuth(async (request, tenantContext) => {
  if (tenantContext.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return handleUpdateConfig(request, tenantContext);
});