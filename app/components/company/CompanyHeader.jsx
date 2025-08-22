import { useRouter } from 'next/navigation';

export default function CompanyHeader({ company, customerId, companiesWithInvoices }) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">
              {company?.name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {company?.name || 'Company'}
            </h1>
            <p className="text-gray-600">Invoice comparison and ticket analysis</p>
          </div>
        </div>
        
        {companiesWithInvoices.length > 0 && (
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Switch Company:</label>
            <div className="relative">
              <select
                value={customerId || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    router.push(`/company?customerId=${e.target.value}`);
                  }
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-w-48"
              >
                <option value="">Select a company...</option>
                {companiesWithInvoices.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}