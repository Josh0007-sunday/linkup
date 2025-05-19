import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

interface ServiceData {
  title: string;
  overview: string;
  proof_img: string;
  category: string;
  amount: number;
  email: string;
  mobile: number;
}

const CreateService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ServiceData>({
    title: "",
    overview: "",
    proof_img: "",
    category: "",
    amount: 0,
    email: "",
    mobile: 0,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const createService = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_CONNECTION;
      const response = await axios.post(`${API_BASE_URL}/services`, data);

      const responseData = response.data;

      if (responseData.error) {
        toast.error(responseData.error, {
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
      } else {
        setData({
          title: "",
          overview: "",
          proof_img: "",
          category: "",
          amount: 0,
          email: "",
          mobile: 0,
        });
        toast.success("Service created successfully!", {
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
        navigate("/services");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("An error occurred while creating the service. Please try again.", {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black flex items-center justify-center p-4">
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            backdropFilter: 'blur(8px)',
          },
        }}
      />

      {/* Form Container */}
      <div className="w-full max-w-2xl">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient-x">Create Service</h1>
          <p className="text-purple-300 mt-2">Add a new service to your portfolio</p>
        </div>

        {/* Service Creation Card */}
        <div className="bg-gray-900/30 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6 md:p-8">
          <form onSubmit={createService} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-purple-300 mb-2">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={data.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-200"
                placeholder="Enter service title"
              />
            </div>

            {/* Overview */}
            <div>
              <label htmlFor="overview" className="block text-sm font-medium text-purple-300 mb-2">
                Overview
              </label>
              <textarea
                id="overview"
                name="overview"
                required
                value={data.overview}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-200"
                placeholder="Enter service overview"
              />
            </div>

            {/* Proof Image URL */}
            <div>
              <label htmlFor="proof_img" className="block text-sm font-medium text-purple-300 mb-2">
                Proof Image URL
              </label>
              <input
                id="proof_img"
                name="proof_img"
                type="text"
                value={data.proof_img}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-200"
                placeholder="Enter proof image URL"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-purple-300 mb-2">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                required
                value={data.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-200"
                placeholder="Enter service category"
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-purple-300 mb-2">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                required
                value={data.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-200"
                placeholder="Enter service amount"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={data.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-purple-300 mb-2">
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="number"
                required
                value={data.mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-200"
                placeholder="Enter your mobile number"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium
                ${loading 
                  ? 'bg-purple-500/50 cursor-not-allowed' 
                  : 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'} 
                transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating service...
                </span>
              ) : (
                'Create Service'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;