export default function InvoiceSelector({ 
  allInvoices, 
  selectedInvoiceA, 
  selectedInvoiceB, 
  setSelectedInvoiceA, 
  setSelectedInvoiceB 
}) {
  if (allInvoices.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Invoice Comparison</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Recent Invoice
          </label>
          <select
            value={selectedInvoiceB}
            onChange={(e) => setSelectedInvoiceB(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">Auto-select (Most Recent)</option>
            {allInvoices.map(invoice => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {new Date(invoice.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Previous Invoice
          </label>
          <select
            value={selectedInvoiceA}
            onChange={(e) => setSelectedInvoiceA(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">Auto-select (Previous)</option>
            {allInvoices.map(invoice => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {new Date(invoice.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Leave selections empty to automatically compare the two most recent invoices
        </p>
      </div>
    </div>
  );
}