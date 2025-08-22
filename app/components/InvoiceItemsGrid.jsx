'use client';
import React from 'react';

export default function InvoiceItemsGrid({ title, items }) {
  if (!items?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="text-center">
          <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No items in {title}.</p>
        </div>
      </div>
    );
  }

  const getItemIdentifier = (item) => {
    return item.catalogItem?.identifier || 
           item.identifier || 
           item.description || 
           item.catalogItem?.description || 
           'Unknown Item';
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
          >
            <div className="text-lg font-medium text-gray-800 mb-3">
              {getItemIdentifier(item)}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-gray-600">
                <span className="font-semibold block">Quantity</span>
                <span className="text-gray-900">{item.quantity || 0}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold block">Unit Price</span>
                <span className="text-gray-900 font-mono">${formatPrice(item.price)}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold block">Total</span>
                <span className="text-gray-900 font-mono font-semibold">${formatPrice(item.extPrice)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
