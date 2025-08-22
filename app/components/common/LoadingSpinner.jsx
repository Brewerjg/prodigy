export default function LoadingSpinner({ title = "Loading", description = "Please wait..." }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}