import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Job {
  _id: string;
  imageUri: string;
  title: string;
  projectname: string;
  price_minimum: number;
  price_maximum: number;
  method: string;
  stack: string[];
  applications?: Array<{
    name: string;
    description: string;
    telegramUsername: string;
    resumeUrl: string;
    appliedAt: Date;
    status: string;
  }>;
}

interface ApplicationResponse {
  message: string;
  application: {
    jobTitle: string;
    name: string | null;
    description: string | null;
    telegramUsername: string | null;
    resumeUrl: string | null;
    status: string;
  };
}

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-100"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-gray-400 border-t-transparent"></div>
      </div>
    </div>
  );
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<ApplicationResponse | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [telegramUsername, setTelegramUsername] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/getJob/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setJob(data.job);

      // Check if user has already applied
      if (data.job.applications && telegramUsername) {
        const userApp = data.job.applications.find(
          (app: { telegramUsername: string }) => app.telegramUsername === telegramUsername
        );
        setHasApplied(!!userApp);
        if (userApp) {
          setApplicationData({
            message: 'Application loaded',
            application: {
              jobTitle: data.job.title,
              name: userApp.name || null,
              description: userApp.description || null,
              telegramUsername: userApp.telegramUsername || null,
              resumeUrl: userApp.resumeUrl || null,
              status: userApp.status,
            },
          });
        }
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]); // Removed telegramUsername from dependencies to prevent unnecessary refreshes

  const handleApply = async () => {
    if (!name && !description && !telegramUsername && !resumeUrl) {
      setApplyError('Please provide at least one field to apply');
      return;
    }

    try {
      setApplyLoading(true);
      setApplyError(null);
      setSuccessMessage(null);

      const payload = { name, description, telegramUsername, resumeUrl };
      console.log('Sending application payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend error response:', data);
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid application data');
        } else if (response.status === 404) {
          throw new Error('Job not found');
        } else {
          throw new Error(data.message || 'Application failed');
        }
      }

      setSuccessMessage(data.message);
      setHasApplied(true);
      setApplicationData(data);
      await fetchJob();

    } catch (error) {
      console.error('Application error:', error);
      setApplyError((error as Error).message || 'Failed to submit application. Please try again.');
    } finally {
      setApplyLoading(false);
    }
  };

  const getTechColor = (tech: string) => {
    const techColors: Record<string, string> = {
      react: 'bg-blue-100 text-blue-700',
      angular: 'bg-red-100 text-red-700',
      vue: 'bg-green-100 text-green-700',
      node: 'bg-green-100 text-green-700',
      python: 'bg-blue-100 text-blue-700',
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-700',
      aws: 'bg-orange-100 text-orange-700',
      docker: 'bg-blue-100 text-blue-700',
      kubernetes: 'bg-blue-100 text-blue-700',
    };

    const matchingTech = Object.keys(techColors).find((key) => tech.toLowerCase().includes(key));
    return matchingTech ? techColors[matchingTech] : 'bg-gray-100 text-gray-700';
  };

  const renderWorkMethod = (method: string) => {
    const methodClasses = {
      Remote: 'bg-purple-100 text-purple-700',
      Hybrid: 'bg-blue-100 text-blue-700',
      'On-site': 'bg-green-100 text-green-700',
      'On site': 'bg-green-100 text-green-700',
      Onsite: 'bg-green-100 text-green-700',
    };

    const defaultClass = 'bg-gray-100 text-gray-700';
    const badgeClass = (methodClasses as any)[method] || defaultClass;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200 flex items-center"
        >
          <span className="mr-1">←</span> Back to Jobs
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : job ? (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="relative">
                <img
                  src={job.imageUri}
                  alt={job.title}
                  className="w-full h-72 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {job.projectname}
                    </span>
                    {job.method && (
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        {job.method}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-center mb-4">
                      <span className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4">
                        $
                      </span>
                      <h2 className="text-xl font-bold text-blue-800">Salary Range</h2>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      ${job.price_minimum.toLocaleString()}
                      <span className="text-blue-400 mx-2">—</span>
                      ${job.price_maximum.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                    <div className="flex items-center mb-4">
                      <span className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
                            clipRule="evenodd"
                          />
                          <path d="M10 4a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3a1 1 0 01-.293-.707V5a1 1 0 011-1z" />
                        </svg>
                      </span>
                      <h2 className="text-xl font-bold text-purple-800">Work Method</h2>
                    </div>
                    <div className="mt-2">
                      {renderWorkMethod(job.method)}
                      <p className="mt-2 text-purple-700">
                        {job.method === 'Remote'
                          ? 'Work from anywhere in the world'
                          : job.method === 'Hybrid'
                          ? 'Combination of remote and office work'
                          : 'Work from our office location'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About the Project</h2>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{job.projectname}</h3>
                    <p className="text-gray-600">
                      This exciting project requires a skilled {job.title} to join our team.
                      {job.method === 'Remote'
                        ? " You'll be working remotely,"
                        : job.method === 'Hybrid'
                        ? " You'll be working in a hybrid arrangement,"
                        : " You'll be working from our office,"}{' '}
                      with competitive compensation between ${job.price_minimum.toLocaleString()} and $
                      {job.price_maximum.toLocaleString()}.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Tech Stack</h2>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {job.stack.map((tech, index) => (
                        <span
                          key={index}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${getTechColor(tech)}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application section moved under job card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this Position</h2>
                
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    {successMessage}
                  </div>
                )}

                {applyError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {applyError}
                  </div>
                )}

                {hasApplied ? (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center">
                    You've already applied for this position!
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe your experience and interest"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="telegramUsername"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Telegram Username
                      </label>
                      <input
                        type="text"
                        id="telegramUsername"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        placeholder="@YourTelegramUsername"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="resumeUrl"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Resume/CV URL
                      </label>
                      <input
                        type="url"
                        id="resumeUrl"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://example.com/your-resume.pdf"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500">
                        Make sure your resume is publicly accessible at this URL
                      </p>
                    </div>

                    <button
                      onClick={handleApply}
                      disabled={applyLoading}
                      className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg transition duration-300 flex items-center justify-center ${
                        applyLoading
                          ? 'opacity-70 cursor-not-allowed'
                          : 'hover:from-indigo-700 hover:to-purple-700'
                      }`}
                    >
                      {applyLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Applying...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">Apply for this Position</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {applicationData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Application</h2>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Applied for: {applicationData.application.jobTitle}
                  </h3>
                  {applicationData.application.name && (
                    <p className="text-gray-600 mb-2">
                      <strong>Name:</strong> {applicationData.application.name}
                    </p>
                  )}
                  {applicationData.application.description && (
                    <p className="text-gray-600 mb-2">
                      <strong>Description:</strong> {applicationData.application.description}
                    </p>
                  )}
                  {applicationData.application.telegramUsername && (
                    <p className="text-gray-600 mb-2">
                      <strong>Telegram Username:</strong> {applicationData.application.telegramUsername}
                    </p>
                  )}
                  {applicationData.application.resumeUrl && (
                    <p className="text-gray-600 mb-2">
                      <strong>Resume URL:</strong>{' '}
                      <a
                        href={applicationData.application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {applicationData.application.resumeUrl}
                      </a>
                    </p>
                  )}
                  <p className="text-gray-600">
                    <strong>Application Status:</strong>{' '}
                    <span className="capitalize">{applicationData.application.status}</span>
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">Job not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;