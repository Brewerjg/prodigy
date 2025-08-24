import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function clearConnectWiseCredentials() {
  try {
    console.log('Clearing ConnectWise credentials for all tenants...');
    
    // Update all tenants to remove ConnectWise credentials
    const result = await prisma.tenant.updateMany({
      data: {
        encrypted_cw_site_url: null,
        encrypted_cw_client_id: null,
        encrypted_cw_public_key: null,
        encrypted_cw_private_key: null,
        encrypted_cw_company_id: null
      }
    });
    
    console.log(`Cleared ConnectWise credentials for ${result.count} tenant(s)`);
    
    // List tenants to confirm
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        encrypted_cw_site_url: true
      }
    });
    
    console.log('\nCurrent tenants:');
    tenants.forEach(tenant => {
      console.log(`- ${tenant.name} (${tenant.subdomain}): ConnectWise configured: ${tenant.encrypted_cw_site_url ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('Error clearing credentials:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearConnectWiseCredentials();