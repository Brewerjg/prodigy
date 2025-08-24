'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '../../hooks/useTenant';
import ConnectWiseSetupWizard from '../setup/ConnectWiseSetupWizard';

const ProfilePage = () => {
  const { user, tenant } = useTenant();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [connectWiseCredentials, setConnectWiseCredentials] = useState({
    site_url: '',
    client_id: '',
    public_key: '',
    private_key: '',
    company_id: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'connectwise' && user?.role === 'ADMIN') {
      fetchConnectWiseCredentials();
    }
  }, [activeTab, user]);

  const fetchConnectWiseCredentials = async () => {
    try {
      const response = await fetch('/api/tenant/connectwise/credentials', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('prodigy_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setConnectWiseCredentials(result.credentials);
      }
    } catch (error) {
      console.error('Failed to fetch ConnectWise credentials:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!profileData.first_name.trim() || !profileData.last_name.trim()) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
      setIsLoading(false);
      return;
    }

    if (profileData.new_password && profileData.new_password !== profileData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (profileData.new_password && profileData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      setIsLoading(false);
      return;
    }

    try {
      const updateData = {
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim()
      };

      if (profileData.new_password) {
        updateData.current_password = profileData.current_password;
        updateData.new_password = profileData.new_password;
      }

      const response = await fetch('/api/tenant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('prodigy_token')}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupWizardComplete = (result) => {
    setShowSetupWizard(false);
    setMessage({ type: 'success', text: 'ConnectWise configuration saved successfully' });
    fetchConnectWiseCredentials();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    ...(user?.role === 'ADMIN' ? [{ id: 'connectwise', label: 'ConnectWise', icon: '🔧' }] : []),
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
      
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              value={profileData.first_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              value={profileData.last_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={profileData.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
          />
          <p className="text-sm text-gray-600 mt-1">Email cannot be changed</p>
        </div>

        <hr className="my-6" />

        <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="current_password"
              value={profileData.current_password}
              onChange={(e) => setProfileData(prev => ({ ...prev, current_password: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter current password to change password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="new_password"
                value={profileData.new_password}
                onChange={(e) => setProfileData(prev => ({ ...prev, new_password: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter new password"
                minLength="8"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm_password"
                value={profileData.confirm_password}
                onChange={(e) => setProfileData(prev => ({ ...prev, confirm_password: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Confirm new password"
                minLength="8"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderConnectWiseTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ConnectWise Integration</h3>
          <p className="text-gray-700">Configure your ConnectWise API credentials</p>
        </div>
        <button
          onClick={() => setShowSetupWizard(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Setup Wizard
        </button>
      </div>

      {connectWiseCredentials.site_url ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">✅ ConnectWise Configured</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-700">Site URL:</dt>
                <dd className="text-gray-900 font-mono text-xs">{connectWiseCredentials.site_url}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700">Client ID:</dt>
                <dd className="text-gray-900 font-mono text-xs">{connectWiseCredentials.client_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700">Company ID:</dt>
                <dd className="text-gray-900 font-mono text-xs">{connectWiseCredentials.company_id}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🔧</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">ConnectWise Not Configured</h4>
          <p className="text-gray-700 mb-4">
            Set up your ConnectWise integration to start syncing data
          </p>
          <button
            onClick={() => setShowSetupWizard(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Configure ConnectWise
          </button>
        </div>
      )}

      {showSetupWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">ConnectWise Setup</h3>
              <button
                onClick={() => setShowSetupWizard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ConnectWiseSetupWizard
                onComplete={handleSetupWizardComplete}
                initialData={connectWiseCredentials}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-700">Role:</dt>
              <dd className="text-gray-900">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user?.role === 'USER' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700">Tenant:</dt>
              <dd className="text-gray-900">{tenant?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700">Subdomain:</dt>
              <dd className="text-gray-900 font-mono">{tenant?.subdomain}</dd>
            </div>
          </dl>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Session Security</h4>
          <p className="text-sm text-gray-700 mb-4">
            Your session will automatically expire after 24 hours of inactivity.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('prodigy_token');
              localStorage.removeItem('prodigy_user');
              localStorage.removeItem('prodigy_tenant');
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  if (!user || !tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Profile & Settings
        </h1>
        <p className="text-gray-700 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'connectwise' && renderConnectWiseTab()}
      {activeTab === 'security' && renderSecurityTab()}
    </div>
  );
};

export default ProfilePage;