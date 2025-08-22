import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function ErrorMessage({ 
  title = "Connection Error", 
  message = "An unexpected error occurred",
  onRetry 
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <BuildingOfficeIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}