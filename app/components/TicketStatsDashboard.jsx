import React from 'react';
import PieChart from './PieChart';
import { 
  ChartPieIcon, 
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Status color mapping for consistency - each color is unique
const statusConfig = {
  'New': { 
    color: '#3b82f6', // Blue
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-800',
    icon: ExclamationTriangleIcon
  },
  'In Progress': { 
    color: '#f59e0b', // Amber
    bgColor: 'bg-amber-100', 
    textColor: 'text-amber-800',
    icon: ClockIcon
  },
  'Dispatch': { 
    color: '#8b5cf6', // Purple
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-800',
    icon: TicketIcon
  },
  'Resolved': { 
    color: '#10b981', // Emerald
    bgColor: 'bg-emerald-100', 
    textColor: 'text-emerald-800',
    icon: CheckCircleIcon
  },
  'Closed': { 
    color: '#6b7280', // Gray
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800',
    icon: XCircleIcon
  }
};

// Priority color mapping - distinct from status colors
const priorityConfig = {
  'High': '#dc2626',    // Red-600 (distinct from all status colors)
  'Medium': '#ea580c',  // Orange-600 (distinct from amber used in status)
  'Low': '#059669',     // Emerald-600 (different shade from status emerald)
  'Normal': '#0891b2',  // Cyan-600 (completely unique)
  'Critical': '#7c2d12' // Red-900 (darker red, distinct from High)
};

// Utility to aggregate tickets from all companies
function aggregateTicketStats(companies, tickets) {
  const statusCounts = {};
  const priorityCounts = {};
  const companyCounts = {};

  // If tickets are provided directly (for single company view)
  if (tickets && Array.isArray(tickets)) {
    tickets.forEach(ticket => {
      const status = normalizeStatus(ticket.status);
      const priority = normalizePriority(ticket.priority);
      const company = normalizeCompany(ticket.company);

      statusCounts[status] = (statusCounts[status] || 0) + 1;
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      if (company !== 'Unknown') {
        companyCounts[company] = (companyCounts[company] || 0) + 1;
      }
    });
  }

  return {
    statusCounts,
    priorityCounts,
    companyCounts,
    totalTickets: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  };
}

function normalizeStatus(status) {
  if (typeof status === 'object') {
    return status?.name || 'Unknown';
  }
  return status || 'Unknown';
}

function normalizePriority(priority) {
  if (typeof priority === 'object') {
    return priority?.name || 'Normal';
  }
  return priority || 'Normal';
}

function normalizeCompany(company) {
  if (typeof company === 'object') {
    return company?.name || 'Unknown';
  }
  return company || 'Unknown';
}

export default function TicketStatsDashboard({ companies = [], tickets = [], title = "Ticket Overview" }) {
  const stats = aggregateTicketStats(companies, tickets);
  
  // Prepare chart data
  const statusChartData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    label: status,
    value: count,
    color: statusConfig[status]?.color || '#475569' // Slate-600 as unique fallback
  }));

  const priorityChartData = Object.entries(stats.priorityCounts).map(([priority, count]) => ({
    label: priority,
    value: count,
    color: priorityConfig[priority] || '#64748b' // Slate-500 as unique fallback
  }));

  // Status cards data
  const statusCards = Object.entries(stats.statusCounts).map(([status, count]) => {
    const config = statusConfig[status] || statusConfig['Closed'];
    const Icon = config.icon;
    
    return {
      status,
      count,
      ...config,
      icon: Icon
    };
  });

  if (stats.totalTickets === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
            <ChartPieIcon className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Tickets Found</h3>
          <p className="text-gray-500">There are currently no tickets to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <ChartPieIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{stats.totalTickets} total tickets across all statuses</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statusCards.map(({ status, count, bgColor, textColor, icon: Icon }) => (
          <div key={status} className={`${bgColor} rounded-xl p-4 border border-opacity-20`}>
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${textColor}`} />
              <span className={`text-2xl font-bold ${textColor}`}>{count}</span>
            </div>
            <div className={`text-sm font-medium ${textColor}`}>{status}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartPieIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
              <p className="text-sm text-gray-500">Breakdown by ticket status</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <PieChart 
              data={statusChartData} 
              size={160} 
              strokeWidth={10}
              showLabels={true}
            />
          </div>
        </div>

        {/* Priority Distribution Chart */}
        {priorityChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
                <p className="text-sm text-gray-500">Breakdown by ticket priority</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <PieChart 
                data={priorityChartData} 
                size={160} 
                strokeWidth={10}
                showLabels={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.statusCounts['New'] || 0}
            </div>
            <div className="text-sm text-gray-600">New Tickets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {(stats.statusCounts['In Progress'] || 0) + (stats.statusCounts['Dispatch'] || 0)}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.statusCounts['Resolved'] || 0}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {stats.statusCounts['Closed'] || 0}
            </div>
            <div className="text-sm text-gray-600">Closed</div>
          </div>
        </div>
      </div>
    </div>
  );
}