'use client';
import React, { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InvoiceItemsGrid from '../components/InvoiceItemsGrid';
import TicketStatusSummary from '../components/TicketStatusSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import CompanyHeader from '../components/company/CompanyHeader';
import InvoiceSelector from '../components/company/InvoiceSelector';
import ComparisonResults from '../components/company/ComparisonResults';
import { useCompany, useAllCompanies } from '../hooks/useCompany';
import { useCompanyTickets } from '../hooks/useTickets';
import { useInvoiceComparison, useAllInvoices } from '../hooks/useInvoices';
import { filterCompaniesWithInvoices } from '../utils/companyUtils';

function CompanyPageContent() {
  const customerId = useSearchParams().get('customerId');
  const [selectedInvoiceA, setSelectedInvoiceA] = useState('');
  const [selectedInvoiceB, setSelectedInvoiceB] = useState('');

  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(customerId);
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useCompanyTickets(customerId);
  const { data, isLoading, error } = useInvoiceComparison(customerId, selectedInvoiceA, selectedInvoiceB);
  const { data: allCompanies } = useAllCompanies();
  const { data: allInvoicesForDropdown } = useAllInvoices();

  const comparison = data?.comparison ?? [];
  const itemsA = data?.itemsA ?? [];
  const itemsB = data?.itemsB ?? [];
  const invoiceA = data?.invoiceA ?? null;
  const invoiceB = data?.invoiceB ?? null;
  const allInvoices = data?.allInvoices ?? [];

  const companiesWithInvoices = useMemo(() => {
    return filterCompaniesWithInvoices(allCompanies, allInvoicesForDropdown);
  }, [allCompanies, allInvoicesForDropdown]);

  if (!customerId) {
    return (
      <ErrorMessage 
        title="No Company Selected"
        message="Please select a company from the dashboard to view details."
      />
    );
  }

  if (companyLoading || isLoading || ticketsLoading) {
    return (
      <LoadingSpinner 
        title="Loading Company Data" 
        description="Fetching invoices and ticket information..." 
      />
    );
  }

  if (companyError || error || ticketsError) {
    return (
      <ErrorMessage 
        title="Data Loading Error"
        message={companyError?.message || error?.message || ticketsError?.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyHeader 
          company={company} 
          customerId={customerId} 
          companiesWithInvoices={companiesWithInvoices} 
        />

        {/* Ticket Status Summary */}
        <div className="mb-8">
          <TicketStatusSummary tickets={tickets} />
        </div>

        <InvoiceSelector 
          allInvoices={allInvoices}
          selectedInvoiceA={selectedInvoiceA}
          selectedInvoiceB={selectedInvoiceB}
          setSelectedInvoiceA={setSelectedInvoiceA}
          setSelectedInvoiceB={setSelectedInvoiceB}
        />

        <ComparisonResults 
          comparison={comparison}
          invoiceA={invoiceA}
          invoiceB={invoiceB}
        />
        
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <InvoiceItemsGrid
              title="Recent Invoice Items"
              items={itemsB}
            />
            <InvoiceItemsGrid
              title="Previous Invoice Items"
              items={itemsA}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<LoadingSpinner title="Loading Page" description="Initializing company page..." />}>
      <CompanyPageContent />
    </Suspense>
  );
}
