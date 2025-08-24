import { PrismaClient } from '@prisma/client';

// Global Prisma client for tenant management (uses public schema)
const globalForPrisma = globalThis ?? global;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Create a tenant-specific Prisma client that uses a specific schema
 */
export function createTenantPrismaClient(schemaName) {
  return new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?schema=${schemaName}`
      }
    },
    log: ['error', 'warn'],
  });
}

/**
 * Execute raw SQL to create a new tenant schema
 */
export async function createTenantSchema(schemaName) {
  try {
    // Create the schema
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    
    // Create tenant-specific tables in the new schema (execute each statement separately)
    const sqlStatements = [
      `CREATE TABLE IF NOT EXISTS "${schemaName}".companies (
        id SERIAL PRIMARY KEY,
        connectwise_id INTEGER UNIQUE NOT NULL,
        name TEXT,
        identifier TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS "${schemaName}".tickets (
        id SERIAL PRIMARY KEY,
        connectwise_id INTEGER UNIQUE NOT NULL,
        company_id INTEGER REFERENCES "${schemaName}".companies(connectwise_id),
        summary TEXT,
        initial_description TEXT,
        status TEXT,
        priority TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS "${schemaName}".ticket_notes (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES "${schemaName}".tickets(connectwise_id),
        text TEXT,
        internal BOOLEAN DEFAULT FALSE,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS "${schemaName}".invoices (
        id SERIAL PRIMARY KEY,
        connectwise_id INTEGER UNIQUE NOT NULL,
        company_id INTEGER REFERENCES "${schemaName}".companies(connectwise_id),
        invoice_number TEXT,
        date TIMESTAMP,
        total DECIMAL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS "${schemaName}".invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES "${schemaName}".invoices(connectwise_id),
        identifier TEXT,
        description TEXT,
        quantity DECIMAL,
        price DECIMAL,
        ext_price DECIMAL,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      // Create indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_companies_connectwise_id ON "${schemaName}".companies(connectwise_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tickets_connectwise_id ON "${schemaName}".tickets(connectwise_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON "${schemaName}".tickets(company_id)`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_connectwise_id ON "${schemaName}".invoices(connectwise_id)`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON "${schemaName}".invoices(company_id)`,
      `CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON "${schemaName}".invoice_items(invoice_id)`
    ];

    // Execute each statement separately
    for (const statement of sqlStatements) {
      await prisma.$executeRawUnsafe(statement);
    }
    
    console.log(`Created tenant schema: ${schemaName}`);
    return true;
  } catch (error) {
    console.error(`Failed to create tenant schema ${schemaName}:`, error);
    throw error;
  }
}

/**
 * Drop a tenant schema (for cleanup/deletion)
 */
export async function dropTenantSchema(schemaName) {
  try {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    console.log(`Dropped tenant schema: ${schemaName}`);
    return true;
  } catch (error) {
    console.error(`Failed to drop tenant schema ${schemaName}:`, error);
    throw error;
  }
}