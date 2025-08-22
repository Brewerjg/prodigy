import { useQuery } from '@tanstack/react-query';

export const useCompany = (customerId) => {
  return useQuery({
    queryKey: ['company', customerId],
    queryFn: async () => {
      const res = await fetch(`/api/connectwise/companies/${customerId}`);
      if (!res.ok) throw new Error('Failed to load company details');
      return res.json();
    },
    enabled: !!customerId
  });
};

export const useAllCompanies = () => {
  return useQuery({
    queryKey: ['allCompanies'],
    queryFn: async () => {
      const res = await fetch('/api/connectwise/companies');
      if (!res.ok) throw new Error('Failed to fetch companies');
      return res.json();
    }
  });
};