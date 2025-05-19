import { useState, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const CreateJob = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    imageUri: "",
    title: "",
    projectname: "",
    price_minimum: 0,
    price_maximum: 0,
    method: "",
    stack: [] as string[], // Array of strings for tech stack
  });

  const methodOptions = ["Remote", "Hybrid", "On-site"];
  const stackOptions = ["React", "TypeScript", "Node.js", "Python", "AWS", "UI/UX"];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStackChange = (stack: string) => {
    const updatedStack = formData.stack.includes(stack)
      ? formData.stack.filter((s) => s !== stack) // Remove if already selected
      : [...formData.stack, stack]; // Add if not selected
    setFormData({ ...formData, stack: updatedStack });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_CONNECTION; // Replace with your backend URL
      const token = localStorage.getItem("auth-token");
      if (!token) {
        toast.error("Please login first");
        window.location.href = "/login";
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/job-listing`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      if (response.data?.message) {
        toast.success(response.data.message);
        // Reset form after successful submission
        setFormData({
          imageUri: "",
          title: "",
          projectname: "",
          price_minimum: 0,
          price_maximum: 0,
          method: "",
          stack: [],
        });
      }
    } catch (error: any) {
      console.error("Job creation error:", error);
      const errorMessage = error.response?.data?.error || "Failed to create job. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Toaster position="bottom-right" />
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Job</h1>
          <p className="text-gray-600 mt-2">Fill in the details to post a new job</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image URI */}
            <div>
              <label htmlFor="imageUri" className="block text-sm font-medium text-gray-700 mb-2">
                Image URI
              </label>
              <input
                id="imageUri"
                name="imageUri"
                type="url"
                value={formData.imageUri}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="https://example.com/image.png"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Senior Frontend Developer"
                required
              />
            </div>

            {/* Project Name */}
            <div>
              <label htmlFor="projectname" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                id="projectname"
                name="projectname"
                type="text"
                value={formData.projectname}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Google"
                required
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price_minimum" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price ($)
                </label>
                <input
                  id="price_minimum"
                  name="price_minimum"
                  type="number"
                  value={formData.price_minimum}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                  placeholder="130000"
                  required
                />
              </div>
              <div>
                <label htmlFor="price_maximum" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price ($)
                </label>
                <input
                  id="price_maximum"
                  name="price_maximum"
                  type="number"
                  value={formData.price_maximum}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                  placeholder="180000"
                  required
                />
              </div>
            </div>

            {/* Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Method
              </label>
              <div className="flex flex-wrap gap-2">
                {methodOptions.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, method })}
                    className={`px-4 py-2 rounded-full border ${
                      formData.method === method
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                    } transition-colors duration-200`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stack
              </label>
              <div className="flex flex-wrap gap-2">
                {stackOptions.map((stack) => (
                  <button
                    key={stack}
                    type="button"
                    onClick={() => handleStackChange(stack)}
                    className={`px-4 py-2 rounded-full border ${
                      formData.stack.includes(stack)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                    } transition-colors duration-200`}
                  >
                    {stack}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-800 active:bg-gray-800"
              } transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Job"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;