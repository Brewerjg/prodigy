# ConnectWise Invoice Comparison Tool

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) that provides a comprehensive invoice comparison tool for ConnectWise users.

## Overview

This application allows users to compare invoice line items between different invoices for companies in ConnectWise. It provides a user-friendly interface to identify price and quantity changes between invoices, helping businesses track billing variations and maintain accurate records.

## Features

- **Company Management**: View and filter active companies from ConnectWise
- **Invoice Comparison**: Compare line items between any two invoices
- **Smart Filtering**: Filter out companies with no invoices
- **Sorting Options**: Sort companies alphabetically (A-Z or Z-A)
- **Visual Differences**: Highlight items with price or quantity changes
- **Flexible Selection**: Choose specific invoices to compare or use default (last two)
- **Detailed Views**: View complete invoice line items in separate grids

## File Structure

```
prodigy/
├── app/                          # Next.js 13+ App Router
│   ├── api/                      # API Routes
│   │   └── connectwise/          # ConnectWise API endpoints
│   │       ├── companies/        # Company-related endpoints
│   │       │   ├── route.js      # GET all companies
│   │       │   └── [id]/         # Individual company endpoints
│   │       │       └── route.js  # GET company by ID
│   │       └── invoices/         # Invoice-related endpoints
│   │           ├── route.js      # GET invoices (with customer filter)
│   │           └── [id]/         # Individual invoice endpoints
│   │               └── route.js  # GET invoice by ID
│   ├── company/                  # Company detail page
│   │   └── page.jsx              # Invoice comparison interface
│   ├── utils/                    # Utility functions
│   │   ├── connectwise.js        # ConnectWise API configuration
│   │   └── providers.js          # React Query provider setup
│   ├── components/               # Reusable components
│   │   └── InvoiceItemsGrid.jsx  # Grid component for invoice items
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout component
│   └── page.jsx                  # Main dashboard (companies list)
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Code Architecture

### Frontend Components

#### `app/page.jsx` - Main Dashboard
- **Purpose**: Displays a list of all active companies
- **Features**:
  - Fetches companies and invoices using React Query
  - Provides sorting options (A-Z, Z-A)
  - Toggle to filter companies with no invoices
  - Click company names to navigate to comparison page
  - Shows last invoice date for each company

#### `app/company/page.jsx` - Invoice Comparison
- **Purpose**: Compares line items between two invoices
- **Features**:
  - Fetches company details and invoice data
  - Dropdown selectors for choosing invoices to compare
  - Comparison table with price/quantity differences
  - Visual highlighting of changed items
  - Detailed invoice item grids

#### `app/components/InvoiceItemsGrid.jsx`
- **Purpose**: Displays invoice line items in a grid format
- **Features**:
  - Reusable component for showing invoice details
  - Responsive grid layout
  - Clean presentation of line item data

### API Endpoints

#### `/api/connectwise/companies`
- **Method**: GET
- **Purpose**: Fetch all companies from ConnectWise
- **Features**: Filters out inactive and test companies

#### `/api/connectwise/companies/[id]`
- **Method**: GET
- **Purpose**: Fetch individual company details
- **Parameters**: Company ID in URL

#### `/api/connectwise/invoices`
- **Method**: GET
- **Purpose**: Fetch invoices with optional customer filtering
- **Query Parameters**: `customerId` (optional)

#### `/api/connectwise/invoices/[id]`
- **Method**: GET
- **Purpose**: Fetch individual invoice details
- **Parameters**: Invoice ID in URL

#### `/api/connectwise/invoice/[id]/invoiceItems`
- **Method**: GET
- **Purpose**: Fetch line items for a specific invoice
- **Parameters**: Invoice ID in URL

### Utility Functions

#### `app/utils/connectwise.js`
- **Purpose**: Centralized ConnectWise API configuration
- **Features**:
  - Environment variable management
  - Authentication header setup
  - Error handling for API calls

#### `app/utils/providers.js`
- **Purpose**: React Query provider setup
- **Features**:
  - Query client configuration
  - Provider wrapper for data fetching

## Data Flow

1. **Dashboard Load**: Fetches companies and invoices in parallel
2. **Company Selection**: User clicks company → navigates to comparison page
3. **Invoice Comparison**: 
   - Fetches company details
   - Fetches all invoices for the company
   - User selects invoices to compare (or uses defaults)
   - Fetches line items for selected invoices
   - Compares and highlights differences
4. **Display**: Shows comparison table and detailed grids

## Technologies Used

- **Next.js 13+**: React framework with App Router
- **React Query**: Data fetching and caching
- **Tailwind CSS**: Styling and responsive design
- **ConnectWise API**: External data source
- **Axios**: HTTP client for API calls

## Environment Variables

Required environment variables:

```env
# Database (get from Neon dashboard)
DATABASE_URL="postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require"

# Development encryption (replace with real key)
ENCRYPTION_MASTER_KEY="your-256-bit-master-key-here-dev-only"

# JWT secret for authentication
JWT_SECRET="your-jwt-secret-here"

# Google Cloud KMS (production only)
GOOGLE_CLOUD_PROJECT_ID="prodigy-production"
GOOGLE_CLOUD_KMS_LOCATION="global" 
GOOGLE_CLOUD_KMS_KEY_RING="prodigy-encryption-ring"
GOOGLE_CLOUD_KMS_KEY="prodigy-tenant-encryption-key"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Environment
NODE_ENV="development"

# Default tenant schema for development
DEFAULT_TENANT_SCHEMA="tenant_default"
```

**Note**: ConnectWise credentials are now stored per-tenant and encrypted in the database.

## Multi-Tenant Setup

This is now a **multi-tenant platform** where each customer gets their own isolated data and ConnectWise configuration.

### Quick Setup

1. **Create a Neon Database**:
   - Go to [Neon Console](https://console.neon.tech/)
   - Create a new project
   - Copy the connection string

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Initialize the database**:
   ```bash
   npm run db:setup
   ```
   This will:
   - Test your database connection
   - Run migrations to create tables
   - Optionally create your first tenant

4. **Start development**:
   ```bash
   npm run dev
   ```

### Multi-Tenant Architecture

- **Schema per tenant**: Each tenant gets their own database schema
- **Encrypted credentials**: ConnectWise API keys are encrypted per-tenant
- **Subdomain routing**: `tenant1.localhost:3000`, `tenant2.localhost:3000`
- **Role-based access**: Admin, User, Viewer roles per tenant

### Tenant URLs

- **Development**: `http://[subdomain].localhost:3000`
- **Production**: `https://[subdomain].yourdomain.com`

### Available Scripts

```bash
npm run dev          # Start development server
npm run db:setup     # Interactive database setup
npm run db:migrate   # Run database migrations  
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


wsl -d ubuntu