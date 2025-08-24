'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTenant } from '../hooks/useTenant';

/**
 * Fetches recent tickets from ConnectWise API
 * @returns {Promise<Array>} Array of recent tickets
 */
const fetchRecentTickets = async (getAuthHeaders) => {
  const res = await fetch('/api/connectwise/tickets?pageSize=20', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

/**
 * Sidebar component that displays a live ticker of new tickets
 * Shows ticket information in a scrolling format
 */
export default function TicketTicker() {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const router = useRouter();
  const { getAuthHeaders, isAuthenticated } = useTenant();

  // Fetch recent tickets using React Query
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['recentTickets'],
    queryFn: () => fetchRecentTickets(getAuthHeaders),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: isAuthenticated()
    // staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Auto-scroll through tickets
  useEffect(() => {
    if (!tickets || tickets.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTicketIndex((prevIndex) => 
        prevIndex === tickets.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change ticket every 5 seconds

    return () => clearInterval(interval);
  }, [tickets]);

  // Get current ticket to display
  const currentTicket = tickets?.[currentTicketIndex];

  // Get priority color based on ticket priority
  const getPriorityColor = (priority) => {
    // Handle priority as object or string
    const priorityValue = typeof priority === 'object' ? priority?.name : priority;
    
    switch (priorityValue?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status color based on ticket status
  const getStatusColor = (status) => {
    // Handle status as object or string
    const statusValue = typeof status === 'object' ? status?.name : status;
    
    switch (statusValue?.toLowerCase()) {
      case 'new':
        return 'text-blue-600 bg-blue-100';
      case 'in progress':
        return 'text-orange-600 bg-orange-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper function to get display value for priority/status
  const getDisplayValue = (value) => {
    if (typeof value === 'object') {
      return value?.name || 'Unknown';
    }
    return value || 'Unknown';
  };

  return (
    <>
      {/* Collapsed state - sleek toggle button */}
      {isCollapsed && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
          <button
            onClick={() => setIsCollapsed(false)}
            className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-6 rounded-l-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            title="View Live Tickets"
          >
            <div className="flex flex-col items-center space-y-3">
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="text-xs font-medium transform -rotate-90 whitespace-nowrap origin-center">
                <span className="block">Recent</span>
                <span className="block mt-1">Tickets</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Expanded state - modern sidebar */}
      {!isCollapsed && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 transition-all duration-300 ease-in-out">
          {/* Modern Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-1">Live Tickets</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-indigo-100 text-sm">
                    {tickets ? `${tickets.length} active tickets` : 'Loading...'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title={isVisible ? "Minimize" : "Expand"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isVisible ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                  </svg>
                </button>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Close panel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isVisible && (
            <div className="flex flex-col h-full overflow-hidden">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Loading Tickets</h3>
                      <p className="text-xs text-gray-500">Fetching latest data...</p>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Connection Error</h3>
                      <p className="text-xs text-gray-500 mt-1">{error.message}</p>
                    </div>
                  </div>
                </div>
              ) : !tickets || tickets.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">No Active Tickets</h3>
                      <p className="text-xs text-gray-500">All caught up! Check back later.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Featured Ticket Card */}
                  <div className="p-6 border-b border-gray-200">
                    <button
                      onClick={() => currentTicket?.id && router.push(`/ticket?id=${currentTicket.id}`)}
                      className="w-full bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:from-slate-100 hover:to-gray-200 transition-all duration-200 text-left"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                            #{currentTicket?.id}
                          </h3>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {currentTicket?.summary}
                          </p>
                        </div>
                        <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(currentTicket?.priority)}`}>
                          {getDisplayValue(currentTicket?.priority)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="space-y-1">
                          <div className="text-gray-500">Status</div>
                          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(currentTicket?.status)}`}>
                            {getDisplayValue(currentTicket?.status)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gray-500">Company</div>
                          <div className="text-gray-900 font-medium truncate">
                            {getDisplayValue(currentTicket?.company)}
                          </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <div className="text-gray-500">Created</div>
                          <div className="text-gray-900">
                            {currentTicket?.dateEntered 
                              ? new Date(currentTicket.dateEntered).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Unknown'
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* View Details Button for Featured Ticket */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-center">
                          <div className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-2 shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View Full Details</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Ticket Navigation */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-gray-500">
                        {currentTicketIndex + 1} of {tickets.length}
                      </div>
                      <div className="flex space-x-1">
                        {tickets.slice(0, 8).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentTicketIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentTicketIndex 
                                ? 'bg-indigo-600' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                        {tickets.length > 8 && (
                          <div className="text-xs text-gray-400 ml-2">+{tickets.length - 8}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tickets List */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                        Recent Activity
                      </h4>
                      <div className="space-y-2">
                        {tickets.slice(0, 20).map((ticket, index) => (
                          <div key={ticket.id} className="relative group">
                            <button
                              onClick={() => setCurrentTicketIndex(index)}
                              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                index === currentTicketIndex
                                  ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                              }`}
                            >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                #{ticket.id}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {getDisplayValue(ticket.priority)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {ticket.summary}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 truncate flex-1 mr-2">
                                {getDisplayValue(ticket.company)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(ticket.status)}`}>
                                  {getDisplayValue(ticket.status)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/ticket?id=${ticket.id}`);
                                  }}
                                  className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 rounded-md transition-all duration-200 flex items-center space-x-1"
                                  title="View ticket details"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>View</span>
                                </button>
                              </div>
                            </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
} 