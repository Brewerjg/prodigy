import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function debugCredentials() {
  try {
    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { subdomain: 'test3' },
      include: {
        encryption_key: true
      }
    });

    if (!tenant) {
      console.error('Tenant not found');
      return;
    }

    console.log('Found tenant:', tenant.name);
    console.log('Encrypted credentials in database:');
    console.log('- site_url:', tenant.encrypted_cw_site_url ? 'EXISTS' : 'NULL');
    console.log('- client_id:', tenant.encrypted_cw_client_id ? 'EXISTS' : 'NULL');
    console.log('- public_key:', tenant.encrypted_cw_public_key ? 'EXISTS' : 'NULL');
    console.log('- private_key:', tenant.encrypted_cw_private_key ? 'EXISTS' : 'NULL');
    console.log('- company_id:', tenant.encrypted_cw_company_id ? 'EXISTS' : 'NULL');

    if (tenant.encrypted_cw_site_url) {
      console.log('\nCorrupted site_url value:');
      console.log('Length:', tenant.encrypted_cw_site_url.length);
      console.log('First 100 chars:', tenant.encrypted_cw_site_url.substring(0, 100));
    }

    // Let's force clear ALL credentials for this tenant specifically
    console.log('\nForcing clear of all credentials for test3...');
    
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        encrypted_cw_site_url: null,
        encrypted_cw_client_id: null,
        encrypted_cw_public_key: null,
        encrypted_cw_private_key: null,
        encrypted_cw_company_id: null
      }
    });

    console.log('All credentials cleared for test3 tenant');

    // Verify
    const updatedTenant = await prisma.tenant.findFirst({
      where: { id: tenant.id }
    });

    console.log('\nVerification - after clearing:');
    console.log('- site_url:', updatedTenant.encrypted_cw_site_url ? 'EXISTS' : 'NULL');
    console.log('- client_id:', updatedTenant.encrypted_cw_client_id ? 'EXISTS' : 'NULL');
    console.log('- public_key:', updatedTenant.encrypted_cw_public_key ? 'EXISTS' : 'NULL');
    console.log('- private_key:', updatedTenant.encrypted_cw_private_key ? 'EXISTS' : 'NULL');
    console.log('- company_id:', updatedTenant.encrypted_cw_company_id ? 'EXISTS' : 'NULL');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCredentials();