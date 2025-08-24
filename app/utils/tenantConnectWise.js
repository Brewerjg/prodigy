import tenantService from '../lib/tenantService.js';

/**
 * Get tenant-specific ConnectWise configuration
 */
export async function getTenantConnectWiseConfig(tenantId) {
  try {
    const credentials = await tenantService.getDecryptedConnectWiseCredentials(tenantId);
    
    console.log('Retrieved credentials for API config:', {
      has_site_url: !!credentials.site_url,
      has_client_id: !!credentials.client_id,
      has_public_key: !!credentials.public_key,
      has_private_key: !!credentials.private_key,
      has_company_id: !!credentials.company_id
    });
    
    if (!credentials.site_url || !credentials.client_id || !credentials.public_key || 
        !credentials.private_key || !credentials.company_id) {
      throw new Error("Missing ConnectWise credentials for tenant");
    }

    // Ensure the site URL has the proper API path
    let baseUrl = credentials.site_url.trim();
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    // Only add the API path if it's not already there
    if (!baseUrl.includes('/v4_6_release/apis/3.0')) {
      baseUrl += 'v4_6_release/apis/3.0/';
    }
    
    console.log('Using ConnectWise API URL:', baseUrl);

    const authString = `${credentials.company_id}+${credentials.public_key}:${credentials.private_key}`;
    const base64Auth = Buffer.from(authString).toString('base64');
    
    console.log('Auth string format:', `${credentials.company_id}+${credentials.public_key.substring(0, 5)}...:[PRIVATE_KEY]`);

    const headers = {
      'Authorization': `Basic ${base64Auth}`,
      'clientId': credentials.client_id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    };

    return { 
      baseUrl, 
      headers 
    };
  } catch (error) {
    console.error('Failed to get tenant ConnectWise config:', error);
    throw error;
  }
}

/**
 * Check if tenant has ConnectWise credentials configured
 */
export async function hasTenantConnectWiseCredentials(tenantId) {
  try {
    const credentials = await tenantService.getDecryptedConnectWiseCredentials(tenantId);
    return !!(credentials.site_url && credentials.client_id && credentials.public_key && 
              credentials.private_key && credentials.company_id);
  } catch (error) {
    return false;
  }
}