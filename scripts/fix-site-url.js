import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import EncryptionService from '../app/lib/encryption.js';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const encryptionService = new EncryptionService();

async function fixSiteUrl() {
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

    // Decrypt the DEK
    const plainDEK = await encryptionService.decryptDataEncryptionKey(
      tenant.encryption_key.encrypted_key
    );

    // Manually set the correct site URL
    // IMPORTANT: Update this with your actual ConnectWise site URL
    const siteUrl = 'https://api-na.myconnectwise.net/'; // <-- UPDATE THIS
    
    console.log('Encrypting site URL:', siteUrl);
    
    // Encrypt the site URL
    const encryptedSiteUrl = encryptionService.encryptData(siteUrl, plainDEK);
    
    console.log('Encrypted site URL:', encryptedSiteUrl.substring(0, 50) + '...');

    // Update the tenant with the new encrypted site URL
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        encrypted_cw_site_url: encryptedSiteUrl
      }
    });

    console.log('Site URL updated successfully');

    // Verify it can be decrypted
    const updatedTenant = await prisma.tenant.findFirst({
      where: { id: tenant.id }
    });

    const decryptedUrl = encryptionService.decryptData(
      updatedTenant.encrypted_cw_site_url,
      plainDEK
    );

    console.log('Verification - decrypted URL:', decryptedUrl);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSiteUrl();