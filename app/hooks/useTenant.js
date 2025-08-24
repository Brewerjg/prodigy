'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing authentication
    const storedToken = localStorage.getItem('prodigy_token');
    const storedUser = localStorage.getItem('prodigy_user');
    const storedTenant = localStorage.getItem('prodigy_tenant');

    if (storedToken && storedUser && storedTenant) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setTenant(JSON.parse(storedTenant));
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, subdomain) => {
    try {
      const response = await fetch(`/api/tenant/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Host': `${subdomain}.${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser(data.user);
      setTenant(data.tenant);

      // Store in localStorage
      localStorage.setItem('prodigy_token', data.token);
      localStorage.setItem('prodigy_user', JSON.stringify(data.user));
      localStorage.setItem('prodigy_tenant', JSON.stringify(data.tenant));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenant(null);
    localStorage.removeItem('prodigy_token');
    localStorage.removeItem('prodigy_user');
    localStorage.removeItem('prodigy_tenant');
    router.push('/login');
  };

  const getAuthHeaders = () => {
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const isAuthenticated = () => {
    return !!(token && user && tenant);
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'VIEWER': 1,
      'USER': 2,
      'ADMIN': 3
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 999;

    return userRoleLevel >= requiredRoleLevel;
  };

  return (
    <TenantContext.Provider value={{
      tenant,
      user,
      token,
      loading,
      login,
      logout,
      getAuthHeaders,
      isAuthenticated,
      hasRole
    }}>
      {children}
    </TenantContext.Provider>
  );
};