import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface CreateJobListingProps {
  onCreateJobListing: (formData: {
    projectName: string;
    position: string;
    description: string;
    time: number;
    applyUrl: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const CreateJobListing: React.FC<CreateJobListingProps> = ({ onCreateJobListing, isLoading }) => {
  const [createJobForm, setCreateJobForm] = useState({
    projectName: '',
    position: '',
    description: '',
    time: 0,
    applyUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createJobForm.projectName || !createJobForm.position || !createJobForm.description || !createJobForm.time || !createJobForm.applyUrl) {
      toast.error('Please fill out all fields', {
        style: {
          background: '#FFEBEE',
          color: '#D32F2F',
          border: '1px solid #FFCDD2',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        iconTheme: {
          primary: '#D32F2F',
          secondary: '#FFEBEE',
        },
      });
      return;
    }

    try {
      await onCreateJobListing(createJobForm);
      toast.success('Job listing created successfully!', {
        style: {
          background: '#E8F5E9',
          color: '#2E7D32',
          border: '1px solid #C8E6C9',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        iconTheme: {
          primary: '#2E7D32',
          secondary: '#E8F5E9',
        },
      });
      setCreateJobForm({
        projectName: '',
        position: '',
        description: '',
        time: 0,
        applyUrl: '',
      });
    } catch (err) {
      toast.error('Failed to create job listing. Please try again.', {
        style: {
          background: '#FFEBEE',
          color: '#D32F2F',
          border: '1px solid #FFCDD2',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        iconTheme: {
          primary: '#D32F2F',
          secondary: '#FFEBEE',
        },
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateJobForm((prev) => ({
      ...prev,
      [name]: name === 'time' ? parseInt(value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          success: {
            style: {
              background: '#E8F5E9',
              color: '#2E7D32',
              border: '1px solid #C8E6C9',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
              primary: '#2E7D32',
              secondary: '#E8F5E9',
            },
          },
          error: {
            style: {
              background: '#FFEBEE',
              color: '#D32F2F',
              border: '1px solid #FFCDD2',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
              primary: '#D32F2F',
              secondary: '#FFEBEE',
            },
          },
        }}
      />

      {/* Form Card */}
      <div className="max-w-5x1 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Job Listing</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                value={createJobForm.projectName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                id="position"
                name="position"
                type="text"
                value={createJobForm.position}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter position"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={createJobForm.description}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter job description"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                End Time (Unix Timestamp)
              </label>
              <input
                id="time"
                name="time"
                type="number"
                value={createJobForm.time}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter end time"
              />
            </div>

            <div>
              <label htmlFor="applyUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Apply URL
              </label>
              <input
                id="applyUrl"
                name="applyUrl"
                type="text"
                value={createJobForm.applyUrl}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter apply URL"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium
                ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-800 active:bg-gray-800'}
                transition-colors duration-200`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Job Listing'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobListing;