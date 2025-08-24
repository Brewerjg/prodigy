import { useQuery } from '@tanstack/react-query';
import { useTenant } from './useTenant.js';

export const useCompany = (customerId) => {
  const { getAuthHeaders, isAuthenticated } = useTenant();
  
  return useQuery({
    queryKey: ['company', customerId],
    queryFn: async () => {
      const res = await fetch(`/api/connectwise/companies/${customerId}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to load company details');
      return res.json();
    },
    enabled: !!customerId && isAuthenticated()
  });
};

export const useAllCompanies = () => {
  const { getAuthHeaders, isAuthenticated } = useTenant();
  
  return useQuery({
    queryKey: ['allCompanies'],
    queryFn: async () => {
      const res = await fetch('/api/connectwise/companies', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch companies');
      return res.json();
    },
    enabled: isAuthenticated()
  });
};