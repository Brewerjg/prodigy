#!/usr/bin/env node

import dotenv from 'dotenv';
import tenantService from '../app/lib/tenantService.js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function createTestTenant() {
  console.log('🏢 Creating test tenant for Prodigy...\n');

  try {
    const result = await tenantService.createTenant({
      name: 'Test Company',
      subdomain: 'test',
      adminEmail: 'admin@test.com',
      adminPassword: 'password123',
      adminFirstName: 'Admin',
      adminLastName: 'User',
      connectWiseCredentials: {
        site_url: process.env.NEXT_PUBLIC_CONNECTWISE_SITE_URL,
        client_id: process.env.NEXT_PUBLIC_CONNECTWISE_CLIENT_ID,
        public_key: process.env.NEXT_PUBLIC_CONNECTWISE_PUBLIC_KEY,
        private_key: process.env.NEXT_PUBLIC_CONNECTWISE_PRIVATE_KEY,
        company_id: process.env.NEXT_PUBLIC_CONNECTWISE_COMPANY_ID
      }
    });

    console.log('✅ Test tenant created successfully!');
    console.log(`\n🎉 Your tenant is ready!`);
    console.log(`📍 Subdomain: test`);
    console.log(`👤 Admin: admin@test.com`);
    console.log(`🔑 Password: password123`);
    console.log(`🔗 URL: http://test.localhost:3000`);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit: http://test.localhost:3000');
    console.log('3. Login with admin@test.com / password123');

  } catch (error) {
    console.error('❌ Failed to create tenant:', error.message);
  }
}

createTestTenant();