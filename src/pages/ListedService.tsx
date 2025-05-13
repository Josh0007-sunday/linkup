import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import LinkUpCarousel from "./addon/LinkupCarousel";
import LoadingSkeleton from "../components/LoadingSkeleton"; // Import your skeleton component

interface Service {
  _id: string;
  title: string;
  overview: string;
  proof_img: string;
  category: string;
  amount: number;
  email: string;
  mobile: number;
  createdAt: string;
}

const ServiceList = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/serviceList`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          success: {
            style: {
              background: "#E8F5E9",
              color: "#2E7D32",
              border: "1px solid #C8E6C9",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
            iconTheme: {
              primary: "#2E7D32",
              secondary: "#E8F5E9",
            },
          },
          error: {
            style: {
              background: "#FFEBEE",
              color: "#D32F2F",
              border: "1px solid #FFCDD2",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
            iconTheme: {
              primary: "#D32F2F",
              secondary: "#FFEBEE",
            },
          },
        }}
      />

      <LinkUpCarousel />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Services</h1>

        {loading ? (
          // Show skeleton loaders while loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="animate-pulse bg-gray-200 h-48 w-full"></div>
                <div className="p-6 space-y-4">
                  <div className="animate-pulse bg-gray-200 h-6 w-3/4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-5/6 rounded"></div>
                  <div className="flex justify-between pt-2">
                    <div className="animate-pulse bg-gray-200 h-4 w-1/3 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-4 w-1/4 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (
          // Show actual content when loaded
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {service.proof_img && (
                  <img
                    src={service.proof_img}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h2>
                  <p className="text-gray-600 mb-4">{service.overview}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">{service.category}</span>
                    <span className="text-lg font-bold text-gray-900">${service.amount}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Email: {service.email}</p>
                    <p>Mobile: {service.mobile}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Created on: {new Date(service.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;