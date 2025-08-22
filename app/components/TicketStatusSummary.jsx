import React from 'react';

// Utility to group tickets by status
function groupByStatus(tickets) {
  const statusMap = {};
  tickets.forEach(ticket => {
    const status = typeof ticket.status === 'object' ? ticket.status?.name : ticket.status || 'Unknown';
    statusMap[status] = (statusMap[status] || 0) + 1;
  });
  return statusMap;
}

// Status color mapping
const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Closed': 'bg-gray-200 text-gray-700',
  'Unknown': 'bg-gray-100 text-gray-500',
};

export default function TicketStatusSummary({ tickets = [] }) {
  const statusCounts = groupByStatus(tickets);
  const statuses = Object.keys(statusCounts);

  if (tickets.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow border text-center text-gray-500">
        No tickets found for this company.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center my-4">
      {statuses.map(status => (
        <div
          key={status}
          className={`flex flex-col items-center px-6 py-4 rounded-xl shadow border ${statusColors[status] || statusColors['Unknown']}`}
        >
          <span className="text-2xl font-bold">{statusCounts[status]}</span>
          <span className="text-sm font-medium mt-1">{status}</span>
        </div>
      ))}
    </div>
  );
} 