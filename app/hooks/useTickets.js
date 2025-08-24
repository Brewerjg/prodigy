import { useQuery } from '@tanstack/react-query';
import { useTenant } from './useTenant.js';

export const useAllTickets = () => {
  const { getAuthHeaders, isAuthenticated } = useTenant();
  
  return useQuery({
    queryKey: ['allTickets'],
    queryFn: async () => {
      const res = await fetch('/api/connectwise/tickets?includeAll=true&pageSize=1000', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    },
    enabled: isAuthenticated()
  });
};

export const useCompanyTickets = (customerId) => {
  const { getAuthHeaders, isAuthenticated } = useTenant();
  
  return useQuery({
    queryKey: ['tickets', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/connectwise/tickets?companyId=${customerId}&includeAll=true`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to load tickets');
      return res.json();
    },
    enabled: !!customerId && isAuthenticated()
  });
};