import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import encryptionService from '../app/lib/encryption.js';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function debugDecryption() {
  try {
    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { subdomain: 'test3' },
      include: {
        encryption_key: true
      }
    });

    const plainDEK = await encryptionService.decryptDataEncryptionKey(
      tenant.encryption_key.encrypted_key
    );

    // Test different strings with special characters
    const testStrings = [
      'simple',
      'with-dashes',
      'with.dots',
      'with:colons',
      'with/slashes',
      'https://example.com',
      'https://api-na.myconnectwise.net/',
    ];

    for (const str of testStrings) {
      try {
        console.log(`\n=== Testing: "${str}" ===`);
        
        const encrypted = encryptionService.encryptData(str, plainDEK);
        console.log('Encrypted successfully:', encrypted.substring(0, 50) + '...');
        
        // Let's examine the encrypted format
        const decoded = Buffer.from(encrypted, 'base64').toString();
        console.log('Decoded format:', decoded.substring(0, 100) + '...');
        console.log('Contains DEK?', decoded.startsWith(plainDEK));
        
        // Try to decrypt
        const decrypted = encryptionService.decryptData(encrypted, plainDEK);
        console.log('Decrypted successfully:', decrypted);
        console.log('Match?', decrypted === str);
        
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDecryption();