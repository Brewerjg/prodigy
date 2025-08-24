import { useQuery } from '@tanstack/react-query';
import { useTenant } from './useTenant.js';

export const useAllInvoices = () => {
  const { getAuthHeaders, isAuthenticated } = useTenant();
  
  return useQuery({
    queryKey: ['allInvoicesForDropdown'],
    queryFn: async () => {
      const res = await fetch('/api/connectwise/invoices', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
    enabled: isAuthenticated()
  });
};

export const useInvoiceComparison = (customerId, selectedInvoiceA, selectedInvoiceB) => {
  const { getAuthHeaders, isAuthenticated } = useTenant();
  
  return useQuery({
    queryKey: ['invoiceComparison', customerId, selectedInvoiceA, selectedInvoiceB],
    queryFn: () => fetchInvoiceComparison(customerId, selectedInvoiceA, selectedInvoiceB, getAuthHeaders()),
    enabled: !!customerId && isAuthenticated()
  });
};

const fetchInvoiceComparison = async (customerId, selectedInvoiceA, selectedInvoiceB, authHeaders) => {
  const invRes = await fetch(`/api/connectwise/invoices?customerId=${customerId}`, {
    headers: authHeaders
  });
  if (!invRes.ok) throw new Error('Failed to load invoices');
  const invoices = await invRes.json();

  if (!Array.isArray(invoices) || invoices.length < 2) {
    return { 
      comparison: [], 
      itemsA: [], 
      itemsB: [], 
      invoiceA: null, 
      invoiceB: null, 
      allInvoices: [] 
    };
  }

  let invoiceA, invoiceB;
  
  const lastTwo = invoices.slice(-2);
  invoiceA = lastTwo[0];
  invoiceB = lastTwo[1];
  
  if (selectedInvoiceA) {
    const customInvoiceA = invoices.find(inv => inv.id === parseInt(selectedInvoiceA));
    if (customInvoiceA) invoiceA = customInvoiceA;
  }
  
  if (selectedInvoiceB) {
    const customInvoiceB = invoices.find(inv => inv.id === parseInt(selectedInvoiceB));
    if (customInvoiceB) invoiceB = customInvoiceB;
  }

  if (!invoiceA || !invoiceB) {
    return { 
      comparison: [], 
      itemsA: [], 
      itemsB: [], 
      invoiceA: null, 
      invoiceB: null, 
      allInvoices: invoices 
    };
  }

  const [itemsA, itemsB] = await Promise.all(
    [invoiceA, invoiceB].map(inv => 
      fetch(`/api/connectwise/invoice/${inv.id}/invoiceItems`, {
        headers: authHeaders
      })
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load items for invoice ${inv.id}`);
          return res.json();
        })
        .then(items => {
          const validItems = Array.isArray(items) ? items : [];
          return validItems.filter(item => {
            return item && (item.catalogItem || item.identifier || item.description || item.id);
          });
        })
    )
  );
  
  if (itemsA.length === 0 && itemsB.length === 0) {
    return { 
      comparison: [], 
      itemsA: [], 
      itemsB: [], 
      invoiceA, 
      invoiceB, 
      allInvoices: invoices 
    };
  }

  const comparison = buildComparison(itemsA, itemsB);

  return { 
    comparison, 
    itemsA, 
    itemsB, 
    invoiceA, 
    invoiceB,
    allInvoices: invoices
  };
};

const getItemKey = (item) => {
  if (!item) return 'unknown_item';
  
  const key = item.catalogItem?.identifier || 
              item.identifier || 
              item.productId || 
              item.description || 
              item.catalogItem?.description ||
              `item_${item.id}` ||
              'unknown_item';
  
  return String(key).trim().toLowerCase();
};

const buildComparison = (itemsA, itemsB) => {
  const map = new Map();
  
  itemsA.forEach(i => {
    const key = getItemKey(i);
    map.set(key, { a: i, b: null });
  });
  
  itemsB.forEach(i => {
    const key = getItemKey(i);
    const entry = map.get(key);
    if (entry) {
      entry.b = i;
    } else {
      map.set(key, { a: null, b: i });
    }
  });

  return Array.from(map.values()).map(({ a, b }) => {
    const getNumericValue = (value, fallback = 0) => {
      if (value === null || value === undefined) return fallback;
      const num = parseFloat(value);
      return isNaN(num) ? fallback : num;
    };

    return {
      key: getItemKey(a || b),
      desc: a?.catalogItem?.identifier || b?.catalogItem?.identifier || 
            a?.description || b?.description || 
            a?.catalogItem?.description || b?.catalogItem?.description || 'Unknown Item',
      price1: getNumericValue(a?.price),
      price2: getNumericValue(b?.price),
      qty1: getNumericValue(a?.quantity),
      qty2: getNumericValue(b?.quantity)
    };
  });
};