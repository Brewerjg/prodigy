import { NextResponse } from 'next/server';
import { withTenantContext } from '../../../../lib/middleware/tenantMiddleware.js';
import tenantService from '../../../../lib/tenantService.js';
import { createSessionToken } from '../../../../lib/jwt.js';

async function handleLogin(request, tenantContext) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await tenantService.authenticateUser(
      email, 
      password, 
      tenantContext.tenant.subdomain
    );

    // Generate JWT token
    const token = createSessionToken(authResult.user, authResult.tenant);

    return NextResponse.json({
      success: true,
      token,
      user: authResult.user,
      tenant: authResult.tenant
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}

export const POST = withTenantContext(handleLogin);