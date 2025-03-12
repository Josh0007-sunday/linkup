import { FaCheckCircle } from "react-icons/fa"; // Green tick icon

const VerificationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default VerificationPage;