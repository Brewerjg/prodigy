'use client';
import React from 'react';
import { useTenant } from '../../hooks/useTenant.js';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/login') return;
    
    // Redirect to login if not authenticated and not loading
    if (!loading && !isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <LoadingSpinner 
        title="Loading Application" 
        description="Checking authentication..." 
      />
    );
  }

  // Allow login page to render without authentication
  if (pathname === '/login') {
    return children;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return (
      <LoadingSpinner 
        title="Redirecting" 
        description="Please wait..." 
      />
    );
  }

  // Render protected content
  return children;
}