'use client';

import { useState } from 'react';
import { useTenant } from '../../hooks/useTenant';

const ConnectWiseSetupWizard = ({ onComplete, initialData = {} }) => {
  const { tenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    site_url: initialData.site_url || '',
    client_id: initialData.client_id || '',
    public_key: initialData.public_key || '',
    private_key: initialData.private_key || '',
    company_id: initialData.company_id || ''
  });

  const steps = [
    {
      title: 'ConnectWise Server Information',
      description: 'Enter your ConnectWise server details',
      fields: ['site_url']
    },
    {
      title: 'API Credentials',
      description: 'Enter your ConnectWise API credentials',
      fields: ['client_id', 'public_key', 'private_key']
    },
    {
      title: 'Company Configuration',
      description: 'Enter your company identifier',
      fields: ['company_id']
    },
    {
      title: 'Test & Save',
      description: 'Test connection and save configuration',
      fields: []
    }
  ];

  const fieldLabels = {
    site_url: 'ConnectWise Site URL',
    client_id: 'Client ID',
    public_key: 'Public Key',
    private_key: 'Private Key',
    company_id: 'Company ID'
  };

  const fieldPlaceholders = {
    site_url: 'https://api-na.myconnectwise.net/v4_6_release/apis/3.0',
    client_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    public_key: 'Your public key',
    private_key: 'Your private key',
    company_id: 'Your company identifier'
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateStep = (step) => {
    const requiredFields = steps[step].fields;
    
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`${fieldLabels[field]} is required`);
        return false;
      }
    }
    
    if (step === 0 && formData.site_url) {
      try {
        new URL(formData.site_url);
      } catch {
        setError('Please enter a valid URL for ConnectWise Site URL');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const testConnection = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/tenant/connectwise/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('prodigy_token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Test connection failed:', result);
        const errorMsg = result.details ? 
          `${result.error}\n\nDetails: ${result.details}` : 
          result.error || 'Connection test failed';
        throw new Error(errorMsg);
      }

      return result;
    } catch (error) {
      console.error('Connection test error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/tenant/connectwise/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('prodigy_token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save configuration');
      }

      if (onComplete) {
        onComplete(result);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAndSave = async () => {
    try {
      await testConnection();
      await saveConfiguration();
    } catch (error) {
      // Error is already set in the respective functions
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    if (currentStep === steps.length - 1) {
      // Test & Save step
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Configuration Summary</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-700">Site URL:</dt>
                <dd className="text-gray-900 font-mono text-xs">{formData.site_url}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700">Client ID:</dt>
                <dd className="text-gray-900 font-mono text-xs">{formData.client_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700">Company ID:</dt>
                <dd className="text-gray-900 font-mono text-xs">{formData.company_id}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Click "Test Connection & Save" below to verify your ConnectWise configuration and save it securely.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {step.fields.map(field => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-2">
              {fieldLabels[field]}
            </label>
            {field === 'private_key' ? (
              <input
                type="password"
                id={field}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={fieldPlaceholders[field]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <input
                type="text"
                id={field}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={fieldPlaceholders[field]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            ConnectWise Setup Wizard
          </h2>
          <p className="text-blue-100">
            Configure your ConnectWise integration for {tenant?.name}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-700">
              {steps[currentStep].description}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleTestAndSave}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing & Saving...
                </>
              ) : (
                'Test Connection & Save'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectWiseSetupWizard;