#!/usr/bin/env node

/**
 * Database setup script for multi-tenant Prodigy
 * 
 * This script helps you:
 * 1. Set up your Neon PostgreSQL database
 * 2. Run initial migrations
 * 3. Create your first tenant
 * 
 * Usage: node scripts/setup-database.js
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import tenantService from '../app/lib/tenantService.js';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Also load .env as fallback

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function setupDatabase() {
  console.log('🚀 Setting up Prodigy Multi-tenant Database\n');

  try {
    // Check if DATABASE_URL is set
    console.log('🔍 Current DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found in environment variables');
      console.log('\nPlease:');
      console.log('1. Create a Neon database at https://console.neon.tech/');
      console.log('2. Copy your connection string');
      console.log('3. Add it to your .env.local file as DATABASE_URL');
      console.log('\nExample:');
      console.log('DATABASE_URL="postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require"');
      return;
    }

    // Test database connection
    console.log('🔍 Testing database connection...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Run migrations
    console.log('📦 Running database migrations...');
    const { execSync } = await import('child_process');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('✅ Migrations completed\n');

    // Ask if user wants to create a tenant
    const createTenant = await question('🏢 Would you like to create your first tenant? (y/n): ');
    
    if (createTenant.toLowerCase() === 'y' || createTenant.toLowerCase() === 'yes') {
      console.log('\n📝 Creating your first tenant...\n');

      const tenantName = await question('Tenant name (e.g., "Acme Corp"): ');
      const subdomain = await question('Subdomain (e.g., "acme"): ');
      const adminEmail = await question('Admin email: ');
      const adminPassword = await question('Admin password: ');
      const adminFirstName = await question('Admin first name: ');
      const adminLastName = await question('Admin last name: ');

      console.log('\n🔧 ConnectWise credentials (optional, can be added later):');
      const siteUrl = await question('ConnectWise Site URL (optional): ');
      const clientId = await question('ConnectWise Client ID (optional): ');
      const publicKey = await question('ConnectWise Public Key (optional): ');
      const privateKey = await question('ConnectWise Private Key (optional): ');
      const companyId = await question('ConnectWise Company ID (optional): ');

      const connectWiseCredentials = {};
      if (siteUrl) connectWiseCredentials.site_url = siteUrl;
      if (clientId) connectWiseCredentials.client_id = clientId;
      if (publicKey) connectWiseCredentials.public_key = publicKey;
      if (privateKey) connectWiseCredentials.private_key = privateKey;
      if (companyId) connectWiseCredentials.company_id = companyId;

      console.log('\n🔄 Creating tenant...');
      
      const result = await tenantService.createTenant({
        name: tenantName,
        subdomain,
        adminEmail,
        adminPassword,
        adminFirstName,
        adminLastName,
        connectWiseCredentials
      });

      console.log('✅ Tenant created successfully!');
      console.log(`\n🎉 Your tenant is ready!`);
      console.log(`📍 Subdomain: ${subdomain}`);
      console.log(`👤 Admin: ${adminEmail}`);
      console.log(`🔗 URL: http://${subdomain}.localhost:3000 (development)`);
      console.log(`🔗 URL: https://${subdomain}.yourdomain.com (production)`);
    }

    console.log('\n✨ Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit your tenant URL');
    console.log('3. Log in with your admin credentials');
    console.log('\n🔒 For production:');
    console.log('- Set up Google Cloud KMS with project: "prodigy-production"');
    console.log('- Create key ring: "prodigy-encryption-ring"');
    console.log('- Create key: "prodigy-tenant-encryption-key"');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

setupDatabase();