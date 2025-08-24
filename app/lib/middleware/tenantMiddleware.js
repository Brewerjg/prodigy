import { NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '../jwt.js';
import tenantService from '../tenantService.js';

/**
 * Middleware to extract tenant context from subdomain and authenticate user
 */
export function withTenantAuth(handler) {
  return async function(request) {
  try {
    // Extract subdomain from request
    const host = request.headers.get('host');
    const subdomain = extractSubdomain(host);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Invalid subdomain' },
        { status: 400 }
      );
    }

    // Get tenant by subdomain
    const tenant = await tenantService.getTenantBySubdomain(subdomain);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (tenant.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tenant is not active' },
        { status: 403 }
      );
    }

    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    // Verify token belongs to this tenant
    if (decoded.tenant.id !== tenant.id) {
      return NextResponse.json(
        { error: 'Token does not match tenant' },
        { status: 403 }
      );
    }

    // Add tenant context to request
    const tenantContext = {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        schema_name: tenant.schema_name
      },
      user: decoded.user
    };

    // Call the actual handler with tenant context
    return handler(request, tenantContext);

  } catch (error) {
    console.error('Tenant middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
  };
}

/**
 * Extract subdomain from host header
 * Examples:
 * - acme.prodigy.com -> acme
 * - tenant1.localhost:3000 -> tenant1
 * - localhost:3000 -> null (no subdomain)
 */
function extractSubdomain(host) {
  if (!host) return null;

  // Remove port if present
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');

  // For localhost development
  if (hostname.includes('localhost')) {
    return parts.length > 1 ? parts[0] : null;
  }

  // For production domains (e.g., tenant.prodigy.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Middleware for public tenant endpoints (no auth required)
 */
export function withTenantContext(handler) {
  return async function(request) {
  try {
    const host = request.headers.get('host');
    const subdomain = extractSubdomain(host);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Invalid subdomain' },
        { status: 400 }
      );
    }

    const tenant = await tenantService.getTenantBySubdomain(subdomain);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const tenantContext = {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        schema_name: tenant.schema_name
      }
    };

    return handler(request, tenantContext);

  } catch (error) {
    console.error('Tenant context middleware error:', error);
    return NextResponse.json(
      { error: 'Failed to load tenant context' },
      { status: 500 }
    );
  }
  };
}

/**
 * Check if user has required role
 */
export function requireRole(requiredRole) {
  return function(request, tenantContext, handler) {
    const userRole = tenantContext.user?.role;
    
    const roleHierarchy = {
      'VIEWER': 1,
      'USER': 2,
      'ADMIN': 3
    };

    const userRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 999;

    if (userRoleLevel < requiredRoleLevel) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, tenantContext);
  };
}