#!/usr/bin/env node

import dotenv from 'dotenv';
import tenantService from '../app/lib/tenantService.js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function createTestTenant() {
  console.log('🏢 Creating second test tenant for Prodigy...\n');

  try {
    const result = await tenantService.createTenant({
      name: 'Test Company 3',
      subdomain: 'test3',
      adminEmail: 'admin@test3.com',
      adminPassword: 'password123',
      adminFirstName: 'Admin',
      adminLastName: 'User2',
      connectWiseCredentials: {
        site_url: process.env.NEXT_PUBLIC_CONNECTWISE_SITE_URL,
        client_id: process.env.NEXT_PUBLIC_CONNECTWISE_CLIENT_ID,
        public_key: process.env.NEXT_PUBLIC_CONNECTWISE_PUBLIC_KEY,
        private_key: process.env.NEXT_PUBLIC_CONNECTWISE_PRIVATE_KEY,
        company_id: process.env.NEXT_PUBLIC_CONNECTWISE_COMPANY_ID
      }
    });

    console.log('✅ Second test tenant created successfully!');
    console.log(`\n🎉 Your tenant is ready!`);
    console.log(`📍 Subdomain: test3`);
    console.log(`👤 Admin: admin@test3.com`);
    console.log(`🔑 Password: password123`);
    console.log(`🔗 URL: http://test3.localhost:3000`);

  } catch (error) {
    console.error('❌ Failed to create tenant:', error.message);
  }
}

createTestTenant();