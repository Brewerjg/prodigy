'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { React } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 