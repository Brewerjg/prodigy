'use client';

import { useRouter } from 'next/navigation';
import ConnectWiseSetupWizard from '../components/setup/ConnectWiseSetupWizard';
import { useTenant } from '../hooks/useTenant';

export default function SetupPage() {
  const router = useRouter();
  const { user, tenant } = useTenant();

  const handleSetupComplete = (result) => {
    // Redirect to dashboard after successful setup
    router.push('/');
  };

  if (!user || !tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only admins can access setup
  if (user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need administrator privileges to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ConnectWiseSetupWizard onComplete={handleSetupComplete} />
    </div>
  );
}