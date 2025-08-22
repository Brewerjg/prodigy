'use client';
import React from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import TicketStatsDashboard from './components/TicketStatsDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import { useAllTickets } from './hooks/useTickets';

export default function Dashboard() {
  const { data: allTickets, isLoading, error } = useAllTickets();

  if (error) {
    return (
      <ErrorMessage 
        message={error.message} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingSpinner 
        title="Loading Dashboard" 
        description="Fetching ticket information..." 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <p className="text-gray-600">Overview of tickets and company portfolio</p>
        </div>

        {/* Ticket Statistics Dashboard */}
        <div className="mb-8">
          <TicketStatsDashboard 
            companies={[]} 
            tickets={allTickets || []} 
            title="Ticket Overview"
          />
        </div>

      </div>
    </div>
  );
}
