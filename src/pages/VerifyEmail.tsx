import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa"; // Green tick icon

const EmailVerify = () => {
  const [validUrl, setValidUrl] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailUrl = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_CONNECTION;
        const url = `${API_BASE_URL}/verify-email/${token}`;
        const { data } = await axios.get(url);
        console.log(data);
        setValidUrl(true);
      } catch (error) {
        console.error("Verification error:", error);
        setValidUrl(false);
      }
    };
    verifyEmailUrl();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {validUrl ? (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          {/* Green tick icon */}
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />

          {/* Success message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Email Verified Successfully!
          </h1>
          <p className="text-gray-600">
            Your email has been verified. You can now log in to your account.
          </p>

          {/* Login button */}
          <button
            onClick={() => navigate("/")}
            className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <h1>404 Not Found</h1>
      )}
    </div>
  );
};

export default EmailVerify;