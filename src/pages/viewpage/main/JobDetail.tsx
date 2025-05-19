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
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-purple-500/20"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-purple-500 border-t-transparent"></div>
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
    <div className="min-h-screen bg-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 text-sm text-purple-400 bg-black/40 backdrop-blur-xl rounded-lg hover:bg-purple-500/20 border border-purple-500/20 flex items-center transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </button>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : job ? (
          <>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 overflow-hidden mb-6">
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
                  <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-purple-500/20 backdrop-blur-sm text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-500/20">
                      {job.projectname}
                    </span>
                    {job.method && (
                      <span className="bg-purple-500/20 backdrop-blur-sm text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-500/20">
                        {job.method}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-black/40 backdrop-blur-xl rounded-lg p-6 border border-purple-500/20">
                    <div className="flex items-center mb-4">
                      <span className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-4 border border-purple-500/20">
                        $
                      </span>
                      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Salary Range</h2>
                    </div>
                    <p className="text-3xl font-bold text-purple-400">
                      ${job.price_minimum.toLocaleString()}
                      <span className="text-purple-500/50 mx-2">—</span>
                      ${job.price_maximum.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-black/40 backdrop-blur-xl rounded-lg p-6 border border-purple-500/20">
                    <div className="flex items-center mb-4">
                      <span className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-4 border border-purple-500/20">
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
                      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Work Method</h2>
                    </div>
                    <div className="mt-2">
                      {renderWorkMethod(job.method)}
                      <p className="mt-2 text-gray-400">
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
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">About the Project</h2>
                  <div className="bg-black/40 backdrop-blur-xl rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-medium text-white mb-2">{job.projectname}</h3>
                    <p className="text-gray-400">
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
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Tech Stack</h2>
                  <div className="bg-black/40 backdrop-blur-xl rounded-lg p-6 border border-purple-500/20">
                    <div className="flex flex-wrap gap-2">
                      {job.stack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application section */}
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 overflow-hidden mb-6">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">Apply for this Position</h2>
                
                {successMessage && (
                  <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6">
                    {successMessage}
                  </div>
                )}

                {applyError && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {applyError}
                  </div>
                )}

                {hasApplied ? (
                  <div className="bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-3 rounded-lg text-center">
                    You've already applied for this position!
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-400 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-400"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe your experience and interest"
                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-400 placeholder-gray-500"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="telegramUsername"
                        className="block text-sm font-medium text-gray-400"
                      >
                        Telegram Username
                      </label>
                      <input
                        type="text"
                        id="telegramUsername"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        placeholder="@YourTelegramUsername"
                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-400 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="resumeUrl"
                        className="block text-sm font-medium text-gray-400"
                      >
                        Resume/CV URL
                      </label>
                      <input
                        type="url"
                        id="resumeUrl"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://example.com/your-resume.pdf"
                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-400 placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-500">
                        Make sure your resume is publicly accessible at this URL
                      </p>
                    </div>

                    <button
                      onClick={handleApply}
                      disabled={applyLoading}
                      className={`w-full py-4 bg-purple-500/20 text-purple-400 font-bold rounded-lg border border-purple-500/20 transition-all duration-300 flex items-center justify-center ${
                        applyLoading
                          ? 'opacity-70 cursor-not-allowed'
                          : 'hover:bg-purple-500/30'
                      }`}
                    >
                      {applyLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-400"
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
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Your Application</h2>
                <div className="bg-black/40 backdrop-blur-xl rounded-lg p-6 border border-purple-500/20">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Applied for: {applicationData.application.jobTitle}
                  </h3>
                  {applicationData.application.name && (
                    <p className="text-gray-400 mb-2">
                      <strong className="text-white">Name:</strong> {applicationData.application.name}
                    </p>
                  )}
                  {applicationData.application.description && (
                    <p className="text-gray-400 mb-2">
                      <strong className="text-white">Description:</strong> {applicationData.application.description}
                    </p>
                  )}
                  {applicationData.application.telegramUsername && (
                    <p className="text-gray-400 mb-2">
                      <strong className="text-white">Telegram Username:</strong> {applicationData.application.telegramUsername}
                    </p>
                  )}
                  {applicationData.application.resumeUrl && (
                    <p className="text-gray-400 mb-2">
                      <strong className="text-white">Resume URL:</strong>{' '}
                      <a
                        href={applicationData.application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                      >
                        {applicationData.application.resumeUrl}
                      </a>
                    </p>
                  )}
                  <p className="text-gray-400">
                    <strong className="text-white">Application Status:</strong>{' '}
                    <span className="capitalize text-purple-400">{applicationData.application.status}</span>
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">Job not found</h3>
            <p className="mt-1 text-xs text-gray-400">The job you're looking for doesn't exist or may have been removed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;