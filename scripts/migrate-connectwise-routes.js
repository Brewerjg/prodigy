#!/usr/bin/env node

/**
 * Migration script to update remaining ConnectWise API routes 
 * to use tenant-aware authentication and configuration
 */

import fs from 'fs';
import path from 'path';

const routesToUpdate = [
  {
    path: 'app/api/connectwise/tickets/[id]/route.js',
    handlerName: 'handleGetTicket',
    hasParams: true
  },
  {
    path: 'app/api/connectwise/tickets/[id]/notes/route.js', 
    handlerName: 'handleGetTicketNotes',
    hasParams: true
  },
  {
    path: 'app/api/connectwise/tickets/[id]/documents/route.js',
    handlerName: 'handleGetTicketDocuments', 
    hasParams: true
  },
  {
    path: 'app/api/connectwise/invoices/[id]/route.js',
    handlerName: 'handleGetInvoice',
    hasParams: true
  },
  {
    path: 'app/api/connectwise/invoice/[id]/invoiceItems/route.js',
    handlerName: 'handleGetInvoiceItems',
    hasParams: true  
  },
  {
    path: 'app/api/connectwise/invoice/route.js',
    handlerName: 'handleGetInvoice',
    hasParams: false
  },
  {
    path: 'app/api/connectwise/invoice/invoices/[companyId]/route.js',
    handlerName: 'handleGetCompanyInvoices', 
    hasParams: true
  }
];

function updateRouteFile(filePath, handlerName, hasParams) {
  console.log(`Updating ${filePath}...`);
  
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if already updated
  if (content.includes('withTenantAuth')) {
    console.log(`⏭️  Already updated: ${filePath}`);
    return;
  }

  // Replace imports
  content = content.replace(
    /import { getConnectWiseConfig } from ['"'][^'"]*['"];?/g,
    ''
  );

  content = content.replace(
    /import { NextResponse } from 'next\/server';/,
    `import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../lib/middleware/tenantMiddleware.js';
import { getTenantConnectWiseConfig } from '../../../utils/tenantConnectWise.js';`
  );

  // Replace GET function signature and config call
  if (hasParams) {
    content = content.replace(
      /export async function GET\(request, { params }\) {/,
      `async function ${handlerName}(request, tenantContext, { params }) {`
    );
    
    content = content.replace(
      /export async function GET\(request, context\) {/,
      `async function ${handlerName}(request, tenantContext, context) {`
    );
  } else {
    content = content.replace(
      /export async function GET\(request\) {/,
      `async function ${handlerName}(request, tenantContext) {`
    );
  }

  // Replace getConnectWiseConfig call
  content = content.replace(
    /const { baseUrl, headers } = getConnectWiseConfig\(\);/g,
    `const { baseUrl, headers } = await getTenantConnectWiseConfig(tenantContext.tenant.id);`
  );

  // Add new export function
  if (hasParams) {
    content += `

export async function GET(request, context) {
  return withTenantAuth(request, (req, tenantContext) => 
    ${handlerName}(req, tenantContext, context)
  );
}`;
  } else {
    content += `

export async function GET(request) {
  return withTenantAuth(request, ${handlerName});
}`;
  }

  fs.writeFileSync(fullPath, content);
  console.log(`✅ Updated: ${filePath}`);
}

function main() {
  console.log('🔄 Migrating ConnectWise routes to multi-tenant...\n');

  for (const route of routesToUpdate) {
    try {
      updateRouteFile(route.path, route.handlerName, route.hasParams);
    } catch (error) {
      console.error(`❌ Failed to update ${route.path}:`, error.message);
    }
  }

  console.log('\n✨ Migration complete!');
  console.log('\n📋 Manual verification needed:');
  console.log('- Check each route file for syntax correctness');
  console.log('- Test API endpoints with tenant authentication');
  console.log('- Verify tenant isolation is working properly');
}

main();