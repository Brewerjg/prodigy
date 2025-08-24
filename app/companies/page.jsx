'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../hooks/useTenant';
import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  AdjustmentsHorizontalIcon,
  EyeSlashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const fetchCompanies = async (getAuthHeaders) => {
  const res = await fetch('/api/connectwise/companies', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
};

const fetchInvoices = async (getAuthHeaders) => {
  const res = await fetch('/api/connectwise/invoices', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
};

export default function CompaniesPage() {
  const router = useRouter();
  const { getAuthHeaders, isAuthenticated } = useTenant();
  const [sortOrder, setSortOrder] = useState('a-z'); // 'a-z' or 'z-a'
  const [hideNoInvoices, setHideNoInvoices] = useState(true);

  const { data: companies, isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: () => fetchCompanies(getAuthHeaders),
    enabled: isAuthenticated()
  });

  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => fetchInvoices(getAuthHeaders),
    enabled: isAuthenticated()
  });

  const isLoading = companiesLoading || invoicesLoading;
  const error = companiesError || invoicesError;

  const lastInvoiceDates = Array.isArray(invoices)
    ? invoices.reduce((acc, inv) => {
        if (inv.company?.id && inv.date) {
          acc[inv.company.id] = inv.date;
        }
        return acc;
      }, {})
    : {};

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    if (!Array.isArray(companies)) return [];

    let filtered = companies.filter(company => 
      company.status?.name !== 'Inactive' && 
      company.status?.name !== 'Not-Approved' && 
      company.identifier !== 'ConnectWise' && 
      company.identifier !== 'XYZTestCompany' && 
      company.identifier !== 'XYZ' && 
      company.identifier !== 'XYZ Test Company' && 
      company.identifier !== 'CompassGRC'
    );

    // Filter out companies with no invoices if toggle is enabled
    if (hideNoInvoices) {
      filtered = filtered.filter(company => 
        lastInvoiceDates[company.id] && lastInvoiceDates[company.id] !== 'No invoices'
      );
    }

    return filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (sortOrder === 'a-z') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }, [companies, sortOrder, hideNoInvoices, lastInvoiceDates]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Connection Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          </div>
          <p className="text-gray-600">Manage and view your company portfolio</p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                  </select>
                  {sortOrder === 'a-z' ? (
                    <ArrowUpIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  ) : (
                    <ArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Hide companies without invoices:</label>
              <button
                onClick={() => setHideNoInvoices(!hideNoInvoices)}
                className={`relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  hideNoInvoices 
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {hideNoInvoices ? (
                  <EyeSlashIcon className="h-4 w-4 mr-2" />
                ) : (
                  <EyeIcon className="h-4 w-4 mr-2" />
                )}
                {hideNoInvoices ? 'Hidden' : 'Visible'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Loading Companies</h3>
                <p className="text-gray-500">Please wait while we fetch your data...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Stats Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Showing {filteredAndSortedCompanies.length} companies
                    </span>
                  </div>
                  {hideNoInvoices && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Filtered
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Identifier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedCompanies.map((company, index) => (
                    <tr 
                      key={company.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <button
                          className="group flex items-center space-x-3 text-left"
                          onClick={() => router.push(`/company?customerId=${company.id}`)}
                        >
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {company.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {company.name}
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {company.identifier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(company.status?.name)}`}>
                          {company.status?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {lastInvoiceDates[company.id] ? (
                            <div className="flex items-center space-x-2">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                              <span>{new Date(lastInvoiceDates[company.id]).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No invoices</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
