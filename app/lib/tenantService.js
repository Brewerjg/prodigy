import { prisma, createTenantSchema, createTenantPrismaClient } from './prisma.js';
import encryptionService from './encryption.js';
import crypto from 'crypto';

export class TenantService {
  /**
   * Create a new tenant with encrypted ConnectWise credentials
   */
  async createTenant({
    name,
    subdomain,
    adminEmail,
    adminPassword,
    adminFirstName,
    adminLastName,
    connectWiseCredentials = {}
  }) {
    try {
      // Generate schema name
      const schemaName = `tenant_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      
      // Check if tenant already exists
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { subdomain },
            { schema_name: schemaName }
          ]
        }
      });

      if (existingTenant) {
        throw new Error(`Tenant with subdomain '${subdomain}' already exists`);
      }

      // Generate data encryption key for this tenant
      const { plainDEK, encryptedDEK } = await encryptionService.generateDataEncryptionKey();

      // Encrypt ConnectWise credentials if provided
      const encryptedCredentials = {};
      for (const [key, value] of Object.entries(connectWiseCredentials)) {
        if (value) {
          encryptedCredentials[`encrypted_cw_${key}`] = encryptionService.encryptData(value, plainDEK);
        }
      }

      // Hash admin password
      const hashedPassword = await encryptionService.hashPassword(adminPassword);

      // Create tenant record in transaction
      const tenant = await prisma.$transaction(async (tx) => {
        // Create tenant
        const newTenant = await tx.tenant.create({
          data: {
            name,
            subdomain,
            schema_name: schemaName,
            ...encryptedCredentials
          }
        });

        // Create encryption key record
        await tx.encryptionKey.create({
          data: {
            tenant_id: newTenant.id,
            encrypted_key: encryptedDEK
          }
        });

        // Create admin user
        await tx.tenantUser.create({
          data: {
            tenant_id: newTenant.id,
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
            first_name: adminFirstName,
            last_name: adminLastName
          }
        });

        return newTenant;
      });

      // Create tenant-specific database schema
      await createTenantSchema(schemaName);

      console.log(`Created tenant: ${name} (${subdomain})`);
      return {
        success: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          schema_name: tenant.schema_name,
          status: tenant.status
        }
      };

    } catch (error) {
      console.error('Failed to create tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain) {
    return prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            first_name: true,
            last_name: true,
            created_at: true
          }
        }
      }
    });
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        encryption_key: true
      }
    });
  }

  /**
   * Get decrypted ConnectWise credentials for a tenant
   */
  async getDecryptedConnectWiseCredentials(tenantId) {
    try {
      console.log('Getting decrypted ConnectWise credentials for tenant:', tenantId);
      
      const tenant = await this.getTenantById(tenantId);
      if (!tenant || !tenant.encryption_key) {
        throw new Error('Tenant or encryption key not found');
      }

      console.log('Tenant found, has credentials:', {
        has_site_url: !!tenant.cw_site_url,
        has_client_id: !!tenant.encrypted_cw_client_id,
        has_public_key: !!tenant.encrypted_cw_public_key,
        has_private_key: !!tenant.encrypted_cw_private_key,
        has_company_id: !!tenant.encrypted_cw_company_id
      });

      // Initialize credentials with plain text site_url
      const credentials = {};
      
      // Add plain text site_url
      if (tenant.cw_site_url) {
        credentials.site_url = tenant.cw_site_url;
        console.log('Plain text site_url:', credentials.site_url);
      }

      // Decrypt the data encryption key for other credentials
      const plainDEK = await encryptionService.decryptDataEncryptionKey(
        tenant.encryption_key.encrypted_key
      );

      // Decrypt encrypted ConnectWise credentials (excluding site_url)
      const encryptedFields = [
        'encrypted_cw_client_id', 
        'encrypted_cw_public_key',
        'encrypted_cw_private_key',
        'encrypted_cw_company_id'
      ];

      for (const field of encryptedFields) {
        if (tenant[field]) {
          try {
            const decryptedValue = encryptionService.decryptData(tenant[field], plainDEK);
            const credentialKey = field.replace('encrypted_cw_', '');
            credentials[credentialKey] = decryptedValue;
            console.log(`Decrypted ${credentialKey}: ${credentialKey === 'private_key' ? '***' : decryptedValue?.substring(0, 20) + '...'}`);
          } catch (decryptError) {
            console.warn(`Failed to decrypt ${field}, credential may be corrupted or empty:`, decryptError.message);
            // Continue with other fields
          }
        }
      }

      console.log('Final credentials keys:', Object.keys(credentials));
      return credentials;
    } catch (error) {
      console.error('Failed to decrypt ConnectWise credentials:', error);
      // Return empty credentials instead of throwing
      return {};
    }
  }

  /**
   * Update tenant ConnectWise credentials
   */
  async updateConnectWiseCredentials(tenantId, newCredentials) {
    try {
      console.log('Updating ConnectWise credentials for tenant:', tenantId);
      
      const tenant = await this.getTenantById(tenantId);
      if (!tenant || !tenant.encryption_key) {
        throw new Error('Tenant or encryption key not found');
      }

      // Decrypt the data encryption key
      const plainDEK = await encryptionService.decryptDataEncryptionKey(
        tenant.encryption_key.encrypted_key
      );
      
      console.log('DEK decrypted successfully');

      // Process credentials (site_url as plain text, others encrypted)
      const updateData = {};
      
      for (const [key, value] of Object.entries(newCredentials)) {
        if (value) {
          if (key === 'site_url') {
            // Store site_url as plain text
            updateData.cw_site_url = value;
            console.log(`Storing site_url as plain text: ${value}`);
          } else {
            // Encrypt other credentials
            const encryptedValue = encryptionService.encryptData(value, plainDEK);
            updateData[`encrypted_cw_${key}`] = encryptedValue;
            console.log(`Encrypted ${key}: ${value.substring(0, 10)}... -> ${encryptedValue.substring(0, 30)}...`);
          }
        }
      }

      // Update tenant
      await prisma.tenant.update({
        where: { id: tenantId },
        data: updateData
      });
      
      console.log('ConnectWise credentials saved to database');

      return { success: true };
    } catch (error) {
      console.error('Failed to update ConnectWise credentials:', error);
      throw error;
    }
  }

  /**
   * Get tenant-specific Prisma client
   */
  getTenantPrismaClient(schemaName) {
    return createTenantPrismaClient(schemaName);
  }

  /**
   * Authenticate user and get tenant context
   */
  async authenticateUser(email, password, subdomain) {
    try {
      const tenant = await this.getTenantBySubdomain(subdomain);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const user = await prisma.tenantUser.findFirst({
        where: {
          tenant_id: tenant.id,
          email
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await encryptionService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          schema_name: tenant.schema_name
        }
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  /**
   * List all tenants (admin function)
   */
  async listTenants() {
    return prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        status: true,
        created_at: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  /**
   * Update tenant status
   */
  async updateTenantStatus(tenantId, status) {
    return prisma.tenant.update({
      where: { id: tenantId },
      data: { status }
    });
  }
}

export default new TenantService();