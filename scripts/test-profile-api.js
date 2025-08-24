#!/usr/bin/env node

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const BASE_URL = 'http://test3.localhost:3000';

async function testProfileAPI() {
  console.log('🧪 Testing Profile API endpoints...\n');

  try {
    // First, we need to login to get a token
    console.log('1. Logging in to get authentication token...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/tenant/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test3.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Login failed: ${error}`);
    }

    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Test getting profile
    console.log('\n2. Testing GET /api/tenant/profile...');
    
    const profileResponse = await fetch(`${BASE_URL}/api/tenant/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      throw new Error(`Get profile failed: ${error}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Profile retrieval successful');
    console.log(`   User: ${profileData.user.first_name} ${profileData.user.last_name}`);
    console.log(`   Email: ${profileData.user.email}`);
    console.log(`   Role: ${profileData.user.role}`);

    // Test updating profile
    console.log('\n3. Testing PUT /api/tenant/profile...');
    
    const updateResponse = await fetch(`${BASE_URL}/api/tenant/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        first_name: 'Updated Admin',
        last_name: 'User Test'
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Profile update failed: ${error}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Profile update successful');
    console.log(`   Updated name: ${updateResult.user.first_name} ${updateResult.user.last_name}`);

    // Test ConnectWise credentials endpoint
    console.log('\n4. Testing GET /api/tenant/connectwise/credentials...');
    
    const credentialsResponse = await fetch(`${BASE_URL}/api/tenant/connectwise/credentials`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (credentialsResponse.ok) {
      const credentialsData = await credentialsResponse.json();
      console.log('✅ ConnectWise credentials retrieval successful');
      console.log(`   Site URL: ${credentialsData.credentials?.site_url || 'Not configured'}`);
      console.log(`   Client ID: ${credentialsData.credentials?.client_id || 'Not configured'}`);
    } else {
      console.log('⚠️ ConnectWise credentials not configured yet (expected)');
    }

    console.log('\n🎉 Profile API testing completed successfully!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit: http://test3.localhost:3000/profile');
    console.log('3. Test the profile page and setup wizard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testProfileAPI();