import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import encryptionService from '../app/lib/encryption.js';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testEncryption() {
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
    
    console.log('DEK decrypted successfully');
    console.log('DEK (first 10 chars):', plainDEK.substring(0, 10) + '...');

    // Test encrypting different values
    const testValues = {
      site_url1: 'https://api-na.myconnectwise.net/',
      site_url2: 'https://example.com/',
      site_url3: 'simple-text',
      client_id: '6f8e8570-b0be-49dd-abc1-23456789',
      public_key: 'testPublicKey123',
      private_key: 'testPrivateKey456',
      company_id: 'core82'
    };

    console.log('\n--- Testing Encryption/Decryption ---');
    
    for (const [key, value] of Object.entries(testValues)) {
      try {
        console.log(`\nTesting ${key}: "${value}"`);
        
        // Encrypt
        const encrypted = encryptionService.encryptData(value, plainDEK);
        console.log(`Encrypted ${key} (first 50 chars):`, encrypted.substring(0, 50) + '...');
        
        // Decrypt
        const decrypted = encryptionService.decryptData(encrypted, plainDEK);
        console.log(`Decrypted ${key}:`, decrypted);
        
        // Check if they match
        const matches = decrypted === value;
        console.log(`${key} roundtrip successful:`, matches);
        
        if (!matches) {
          console.error(`❌ MISMATCH for ${key}!`);
          console.error(`Original: "${value}"`);
          console.error(`Decrypted: "${decrypted}"`);
        }
        
      } catch (error) {
        console.error(`❌ Error with ${key}:`, error.message);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEncryption();