import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import encryptionService from '../app/lib/encryption.js';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function recreateTestTenant() {
  try {
    console.log('🚀 Recreating test tenant...');

    // Check if tenant exists, create if not
    let tenant = await prisma.tenant.findUnique({
      where: { subdomain: 'test3' }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Test Company 3',
          subdomain: 'test3',
          schema_name: 'tenant_test3',
          status: 'ACTIVE'
        }
      });
      console.log('✅ Created tenant:', tenant.name);
    } else {
      console.log('✅ Tenant already exists:', tenant.name);
    }

    // Create encryption key for the tenant if it doesn't exist
    const existingKey = await prisma.encryptionKey.findUnique({
      where: { tenant_id: tenant.id }
    });

    if (!existingKey) {
      const keyResult = await encryptionService.generateDataEncryptionKey();
      
      await prisma.encryptionKey.create({
        data: {
          tenant_id: tenant.id,
          encrypted_key: keyResult.encryptedDEK,
          key_version: 1
        }
      });
      console.log('✅ Created encryption key');
    } else {
      console.log('✅ Encryption key already exists');
    }

    // Create admin user if it doesn't exist
    const existingUser = await prisma.tenantUser.findFirst({
      where: {
        tenant_id: tenant.id,
        email: 'admin@test3.com'
      }
    });

    if (!existingUser) {
      const hashedPassword = await encryptionService.hashPassword('password123');
      
      const user = await prisma.tenantUser.create({
        data: {
          tenant_id: tenant.id,
          email: 'admin@test3.com',
          password: hashedPassword,
          role: 'ADMIN',
          first_name: 'Test',
          last_name: 'Admin'
        }
      });
      console.log('✅ Created admin user:', user.email);
    } else {
      console.log('✅ Admin user already exists:', existingUser.email);
    }

    console.log('\n🎉 Test tenant setup complete!');
    console.log('Login with: admin@test3.com / password123');
    console.log('URL: http://test3.localhost:3000/login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateTestTenant();