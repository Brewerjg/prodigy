import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../lib/middleware/tenantMiddleware.js';
import tenantService from '../../../../lib/tenantService.js';

async function handleGetCredentials(request, { user, tenant }) {
  try {
    // Only admins can view credentials
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const credentials = await tenantService.getDecryptedConnectWiseCredentials(tenant.id);
    
    // Return credentials with private key masked for security  
    const maskedCredentials = {
      ...credentials,
      private_key: credentials.private_key ? '••••••••••••••••' : ''
    };

    return NextResponse.json({
      success: true,
      credentials: maskedCredentials
    });

  } catch (error) {
    console.error('Get ConnectWise credentials error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve credentials' },
      { status: 500 }
    );
  }
}

async function handleUpdateCredentials(request, { user, tenant }) {
  try {
    // Only admins can update credentials
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const credentials = await request.json();
    
    console.log('Saving ConnectWise credentials for tenant:', tenant.subdomain, {
      site_url: credentials.site_url,
      client_id: credentials.client_id,
      company_id: credentials.company_id,
      public_key: credentials.public_key?.substring(0, 5) + '...',
      private_key: credentials.private_key ? '***' : 'missing'
    });
    
    // Validate required fields
    const requiredFields = ['site_url', 'client_id', 'public_key', 'private_key', 'company_id'];
    for (const field of requiredFields) {
      if (!credentials[field]?.trim()) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate URL format
    try {
      new URL(credentials.site_url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid site URL format' },
        { status: 400 }
      );
    }

    // Update tenant credentials
    await tenantService.updateConnectWiseCredentials(tenant.id, credentials);

    return NextResponse.json({
      success: true,
      message: 'ConnectWise credentials updated successfully'
    });

  } catch (error) {
    console.error('Update ConnectWise credentials error:', error);
    return NextResponse.json(
      { error: 'Failed to update credentials: ' + error.message },
      { status: 500 }
    );
  }
}

export const GET = withTenantAuth(handleGetCredentials);
export const POST = withTenantAuth(handleUpdateCredentials);