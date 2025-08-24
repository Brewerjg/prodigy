import { NextResponse } from 'next/server';
import tenantService from '../../../lib/tenantService.js';

export async function POST(request) {
  try {
    const {
      name,
      subdomain,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      connectWiseCredentials
    } = await request.json();

    // Validate required fields
    if (!name || !subdomain || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subdomain, adminEmail, adminPassword' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(subdomain) || subdomain.length < 2) {
      return NextResponse.json(
        { error: 'Invalid subdomain format. Must be alphanumeric with hyphens, 2+ characters' },
        { status: 400 }
      );
    }

    // Reserved subdomains
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog'];
    if (reservedSubdomains.includes(subdomain.toLowerCase())) {
      return NextResponse.json(
        { error: 'Subdomain is reserved' },
        { status: 400 }
      );
    }

    const result = await tenantService.createTenant({
      name,
      subdomain,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      connectWiseCredentials: connectWiseCredentials || {}
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Tenant creation error:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}