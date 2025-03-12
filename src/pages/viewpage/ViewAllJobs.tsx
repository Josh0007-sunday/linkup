import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Job {
  _id: string;
  imageUri: string;
  title: string;
  projectname: string;
  price_minimum: number;
  price_maximum: number;
  method: string;
  stack: string[];
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

const ViewAllJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getJobs`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setJobs(data.jobs);
        setError(null);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate("/homepage")}
          className="mb-6 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ← Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Jobs</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/main/jobdetails/${job._id}`)}
                >
                  <div className="mb-6">
                    <img
                      src={job.imageUri}
                      alt={job.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{job.projectname}</p>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-sm">
                      ${job.price_minimum.toLocaleString()} - $
                      {job.price_maximum.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-sm">{job.method}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.stack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No jobs found. Check back later.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllJobs;