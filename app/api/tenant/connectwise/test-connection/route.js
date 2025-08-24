import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../../lib/middleware/tenantMiddleware.js';

async function handleTestConnection(request, { user, tenant }) {
  try {
    const credentials = await request.json();
    
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

    // Test ConnectWise API connection
    // Ensure the site URL has the proper API path
    let apiUrl = credentials.site_url.trim();
    if (!apiUrl.endsWith('/')) {
      apiUrl += '/';
    }
    if (!apiUrl.includes('/v4_6_release/apis/3.0')) {
      apiUrl += 'v4_6_release/apis/3.0/';
    }
    
    const testEndpoint = `${apiUrl}system/info`;
    const auth = Buffer.from(`${credentials.company_id}+${credentials.public_key}:${credentials.private_key}`).toString('base64');
    
    console.log('Testing ConnectWise connection:', {
      endpoint: testEndpoint,
      clientId: credentials.client_id,
      companyId: credentials.company_id,
      publicKey: credentials.public_key.substring(0, 5) + '...'
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'clientId': credentials.client_id,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      let errorMessage = 'ConnectWise API connection failed';
      let errorDetails = '';
      
      try {
        const errorBody = await response.text();
        console.error('ConnectWise API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        errorDetails = errorBody;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      if (response.status === 401) {
        errorMessage = 'Invalid credentials - please check your public/private keys and company ID';
      } else if (response.status === 403) {
        errorMessage = 'Access denied - please check your API permissions';
      } else if (response.status === 404) {
        errorMessage = 'ConnectWise API endpoint not found - please check your site URL';
      } else {
        errorMessage = `ConnectWise API error (${response.status}): ${response.statusText}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          status: response.status,
          details: errorDetails 
        },
        { status: 400 }
      );
    }

    const systemInfo = await response.json();
    
    // Test a basic endpoint to ensure we can make API calls
    const companiesEndpoint = `${apiUrl}company/companies?pageSize=1`;
    const companiesResponse = await fetch(companiesEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'clientId': credentials.client_id,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!companiesResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to access company data - please check API permissions' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ConnectWise connection successful',
      systemInfo: {
        version: systemInfo.version || 'Unknown',
        isCloud: systemInfo.isCloud || false
      }
    });

  } catch (error) {
    console.error('ConnectWise test connection error:', error);
    
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Connection timeout - please check your site URL and network connection' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Connection test failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const POST = withTenantAuth(handleTestConnection);