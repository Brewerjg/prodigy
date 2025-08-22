export default function ComparisonResults({ comparison, invoiceA, invoiceB }) {
  if (comparison.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Comparison Available</h3>
          <p className="text-gray-500">Not enough invoices to perform a comparison analysis.</p>
        </div>
      </div>
    );
  }

  const PRICE_TOLERANCE = 0.001;
  const changedItems = comparison.filter(r => {
    const priceDiff = Math.abs(r.price1 - r.price2) > PRICE_TOLERANCE;
    const qtyDiff = r.qty1 !== r.qty2;
    return priceDiff || qtyDiff;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Item Comparison</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-200 rounded"></div>
              <span className="text-gray-600">Changed items</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="font-medium text-gray-900">Total Items</div>
            <div className="text-lg font-bold text-indigo-600">{comparison.length}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="font-medium text-gray-900">Changed Items</div>
            <div className="text-lg font-bold text-amber-600">{changedItems.length}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="font-medium text-gray-900">Invoices Compared</div>
            <div className="text-xs text-gray-600">
              {invoiceA?.invoiceNumber} vs {invoiceB?.invoiceNumber}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Item Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div>Recent Price</div>
                <div className="text-sm font-bold text-indigo-600 normal-case">
                  {invoiceB?.invoiceNumber || 'N/A'}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div>Previous Price</div>
                <div className="text-sm font-bold text-indigo-600 normal-case">
                  {invoiceA?.invoiceNumber || 'N/A'}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Qty
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Previous Qty
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Changes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparison.map((r, index) => {
              const priceDiff = Math.abs(r.price1 - r.price2) > PRICE_TOLERANCE;
              const qtyDiff = r.qty1 !== r.qty2;
              const changed = priceDiff || qtyDiff;
              
              const diffText = [];
              if (priceDiff) {
                const priceDifference = r.price2 - r.price1;
                diffText.push(`$${priceDifference >= 0 ? '+' : ''}${priceDifference.toFixed(2)}`);
              }
              if (qtyDiff) {
                const qtyDifference = r.qty2 - r.qty1;
                diffText.push(`${qtyDifference > 0 ? '+' : ''}${qtyDifference} qty`);
              }

              return (
                <tr 
                  key={r.key} 
                  className={`${changed ? 'bg-amber-50' : ''} ${index % 2 === 0 ? 'bg-gray-50/30' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {changed && (
                        <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{r.desc}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-900 font-mono">${r.price2.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-900 font-mono">${r.price1.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-900">{r.qty2}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-900">{r.qty1}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {changed ? (
                      <span className="text-sm font-medium text-amber-800">
                        {diffText.join(', ')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No change</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}