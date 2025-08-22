'use client';
import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  TicketIcon,
  BuildingOfficeIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

const fetchTicketDetails = async (ticketId) => {
  const res = await fetch(`/api/connectwise/tickets/${ticketId}`);
  if (!res.ok) throw new Error('Failed to fetch ticket details');
  return res.json();
};

const fetchTicketNotes = async (ticketId) => {
  const res = await fetch(`/api/connectwise/tickets/${ticketId}/notes`);
  if (!res.ok) throw new Error('Failed to fetch ticket notes');
  return res.json();
};

const fetchTicketDocuments = async (ticketId) => {
  const res = await fetch(`/api/connectwise/tickets/${ticketId}/documents`);
  if (!res.ok) throw new Error('Failed to fetch ticket documents');
  return res.json();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatValue = (value) => {
  if (typeof value === 'object' && value?.name) {
    return value.name;
  }
  return value || 'Not specified';
};

const cleanDescription = (description) => {
  if (!description) return '';
  
  let cleaned = description;
  
  // Remove HTML tags and entities
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, '');
  
  // Remove complex markdown link patterns with multiple nested brackets
  cleaned = cleaned.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '');
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '');
  
  // Remove any remaining markdown links
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  
  // Remove URLs (including complex ones with parameters)
  cleaned = cleaned.replace(/https?:\/\/[^\s\)]+/g, '');
  
  // Remove email patterns
  cleaned = cleaned.replace(/\(mailto:[^)]+\)/g, '');
  cleaned = cleaned.replace(/mailto:[^\s]+/g, '');
  
  // Remove address patterns (street address, city, state, zip, country)
  cleaned = cleaned.replace(/\d+\s+[A-Za-z\s]+,\s+[A-Za-z\s]+,\s+[A-Z]{2},?\s+\d{5}(-\d{4})?,\s+[A-Za-z\s]+/g, '');
  
  // Remove phone number patterns
  cleaned = cleaned.replace(/[OME]\s*\d{3}[‑\-]\d{3}[‑\-]\d{4}/g, '');
  cleaned = cleaned.replace(/\d{3}[‑\-]\d{3}[‑\-]\d{4}/g, '');
  
  // Remove common signature elements
  cleaned = cleaned.replace(/Licenses:.*$/gm, '');
  cleaned = cleaned.replace(/Trees have feelings too\..*$/gm, '');
  
  // Remove lines that are likely signature elements
  cleaned = cleaned.replace(/^[OME]\s*$/gm, ''); // O, M, E labels for contact info
  
  // Split into lines and filter out signature-like content
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) return false;
    
    // Skip lines that look like contact info labels
    if (/^[OME]\s*$/.test(trimmed)) return false;
    
    // Skip lines with only punctuation or special characters
    if (/^[^\w\s]*$/.test(trimmed)) return false;
    
    // Skip lines that are just URLs or fragments
    if (/^(https?:\/\/|www\.|\.com|\[|\]|\(|\)|&amp;|data=|sdata=)/.test(trimmed)) return false;
    
    // Keep lines that have actual content (letters and meaningful text)
    return /[a-zA-Z]{2,}/.test(trimmed) && trimmed.length > 2;
  });
  
  cleaned = filteredLines.join('\n');
  
  // Final cleanup
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excessive line breaks
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize spaces
  cleaned = cleaned.trim();
  
  return cleaned;
};

function TicketDetailPageContent() {
  const ticketId = useSearchParams().get('id');
  const router = useRouter();

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => fetchTicketDetails(ticketId),
    enabled: !!ticketId
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['ticketNotes', ticketId],
    queryFn: () => fetchTicketNotes(ticketId),
    enabled: !!ticketId
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['ticketDocuments', ticketId],
    queryFn: () => fetchTicketDocuments(ticketId),
    enabled: !!ticketId
  });

  const getPriorityColor = (priority) => {
    const priorityValue = formatValue(priority).toLowerCase();
    switch (priorityValue) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    const statusValue = formatValue(status).toLowerCase();
    switch (statusValue) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    const statusValue = formatValue(status).toLowerCase();
    switch (statusValue) {
      case 'new':
        return ExclamationTriangleIcon;
      case 'in progress':
        return ClockIcon;
      case 'resolved':
        return CheckCircleIcon;
      case 'closed':
        return XCircleIcon;
      default:
        return TicketIcon;
    }
  };

  if (!ticketId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="p-3 bg-amber-100 rounded-full w-fit mx-auto mb-4">
              <TicketIcon className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ticket Selected</h3>
            <p className="text-gray-600">Please select a ticket to view its details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Loading Ticket</h3>
                <p className="text-gray-500">Fetching ticket details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Ticket</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button 
              onClick={() => router.back()} 
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(ticket.status);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to previous page
          </button>
        </div>

        {/* Ticket Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <TicketIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Ticket #{ticket.id}
                </h1>
                <p className="text-gray-600 mt-1">{ticket.summary}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
                {formatValue(ticket.priority)} Priority
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {formatValue(ticket.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Initial Description */}
            {ticket.initialDescription && cleanDescription(ticket.initialDescription) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Initial Description</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{cleanDescription(ticket.initialDescription)}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              </div>
              {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading notes...</span>
                </div>
              ) : !notes || notes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No notes available for this ticket</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes
                    .filter(note => cleanDescription(note.text).trim().length > 0)
                    .map((note, index) => {
                      const cleanedText = cleanDescription(note.text);
                      return (
                        <div key={note.id || index} className="border-l-4 border-indigo-200 bg-indigo-50 p-4 rounded-r-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-indigo-900">
                                {formatValue(note.member) || formatValue(note.createdBy) || 'System'}
                              </span>
                              {note.internalFlag && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                  Internal
                                </span>
                              )}
                            </div>
                            <time className="text-xs text-indigo-600">
                              {formatDate(note.dateCreated)}
                            </time>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-indigo-800 whitespace-pre-wrap">{cleanedText}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PaperClipIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
              </div>
              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading attachments...</span>
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                    <PaperClipIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No attachments found for this ticket</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {documents.map((doc, index) => (
                    <div key={doc.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded">
                          <PaperClipIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.title || 'Untitled Document'}</p>
                          <p className="text-xs text-gray-500">
                            {doc.fileName && `${doc.fileName} • `}
                            {formatDate(doc.dateCreated)}
                            {doc.createdBy && ` • by ${formatValue(doc.createdBy)}`}
                          </p>
                        </div>
                      </div>
                      {doc.publicFlag && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolution */}
            {ticket.resolution && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Resolution</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.resolution}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">{formatDate(ticket.dateEntered)}</p>
                  </div>
                </div>
                {ticket.dateResolved && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Resolved</p>
                      <p className="text-sm text-gray-600">{formatDate(ticket.dateResolved)}</p>
                    </div>
                  </div>
                )}
                {ticket.closedDate && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <XCircleIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Closed</p>
                      <p className="text-sm text-gray-600">{formatDate(ticket.closedDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatValue(ticket.company)}</p>
                    <p className="text-xs text-gray-500">Company Name</p>
                  </div>
                </div>
                {ticket.contact && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatValue(ticket.contact)}</p>
                      <p className="text-xs text-gray-500">Contact Person</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              <div className="space-y-3">
                {ticket.owner && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatValue(ticket.owner)}</p>
                      <p className="text-xs text-gray-500">Owner</p>
                    </div>
                  </div>
                )}
                {ticket.team && (
                  <div className="flex items-center space-x-3">
                    <TagIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatValue(ticket.team)}</p>
                      <p className="text-xs text-gray-500">Team</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
              <div className="space-y-3">
                {ticket.type && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="text-sm font-medium text-gray-900">{formatValue(ticket.type)}</p>
                  </div>
                )}
                {ticket.subType && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sub Type</p>
                    <p className="text-sm font-medium text-gray-900">{formatValue(ticket.subType)}</p>
                  </div>
                )}
                {ticket.item && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Item</p>
                    <p className="text-sm font-medium text-gray-900">{formatValue(ticket.item)}</p>
                  </div>
                )}
                {ticket.severity && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Severity</p>
                    <p className="text-sm font-medium text-gray-900">{formatValue(ticket.severity)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(ticket.budget || ticket.actualHours || ticket.estimatedHours) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time & Budget</h3>
                <div className="space-y-3">
                  {ticket.estimatedHours && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Estimated Hours</p>
                      <p className="text-sm font-medium text-gray-900">{ticket.estimatedHours}</p>
                    </div>
                  )}
                  {ticket.actualHours && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Actual Hours</p>
                      <p className="text-sm font-medium text-gray-900">{ticket.actualHours}</p>
                    </div>
                  )}
                  {ticket.budget && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Budget</p>
                      <p className="text-sm font-medium text-gray-900">${ticket.budget}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Loading Page</h3>
                <p className="text-gray-500">Initializing ticket page...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <TicketDetailPageContent />
    </Suspense>
  );
}