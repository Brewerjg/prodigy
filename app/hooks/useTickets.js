import { useQuery } from '@tanstack/react-query';

export const useAllTickets = () => {
  return useQuery({
    queryKey: ['allTickets'],
    queryFn: async () => {
      const res = await fetch('/api/connectwise/tickets?includeAll=true&pageSize=1000');
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    }
  });
};

export const useCompanyTickets = (customerId) => {
  return useQuery({
    queryKey: ['tickets', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/connectwise/tickets?companyId=${customerId}&includeAll=true`);
      if (!res.ok) throw new Error('Failed to load tickets');
      return res.json();
    },
    enabled: !!customerId
  });
};