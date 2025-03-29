import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Define the API base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setMessage(res.data.message);
      toast.success(res.data.message);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors
        setMessage(err.response?.data?.error || "An error occurred");
        toast.error(err.response?.data?.error || "An error occurred");
      } else {
        // Handle other errors
        setMessage("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a reset link.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-800 active:bg-gray-800"
                } 
                transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
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
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Remember your password?{" "}
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;