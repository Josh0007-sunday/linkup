import { useState, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../components/AUTH/page";
import { FaRobot, FaMagic, FaChartLine } from 'react-icons/fa';

interface LoginData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const loginUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = data;
    setLoading(true);

    try {
      const response = await axios.post("/", { email, password });

      const responseData = response.data;

      if (responseData.error) {
        toast.error(responseData.error);
      } else {
        localStorage.setItem("auth-token", responseData.token);
        localStorage.setItem("user", JSON.stringify(responseData.user));

        setUser(responseData.user);
        setIsAuthenticated(true);

        setData({ email: "", password: "" });
        toast.success("Login Successful! Welcome back!");
        navigate("/homepage");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen lg:overflow-hidden overflow-auto bg-black text-white font-['Outfit'] relative">
      {/* Background Elements */}
      <div className="animated-background" />
      <div className="grid-background" />
      <div className="theme-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(147, 51, 234, 0.3)',
          },
        }}
      />

      <div className="h-full lg:h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left Side - Branding */}
            <div className="w-full lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech'] mb-4">
                LinkUp
              </h1>
              <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8">Connect with opportunities that match your campus journey</p>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {[
                  { icon: <FaRobot className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Smart Job Matching for Students" },
                  { icon: <FaMagic className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Campus Marketing & Networking" },
                  { icon: <FaChartLine className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Career Growth Tracking" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
                    <div className="text-purple-400">{feature.icon}</div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2">
              <div className="backdrop-blur-sm bg-black/50 rounded-xl border border-purple-500/30 p-6 sm:p-8 hover:border-purple-500/60 transition-all duration-300">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech']">
                    Welcome Back
                  </h2>
                  <p className="text-gray-400 mt-2 text-sm sm:text-base">Continue your career journey</p>
                </div>

                <form onSubmit={loginUser} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={data.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition-colors duration-200 text-sm sm:text-base"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={data.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 sm:py-3 rounded-lg bg-black/50 border border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition-colors duration-200 text-sm sm:text-base"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-white font-medium text-sm sm:text-base
                      ${loading
                        ? 'bg-purple-900/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'} 
                      transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </button>

                  <div className="text-center space-y-2">
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Don't have an account?{" "}
                      <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
                        Sign up
                      </Link>
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Can't remember your password?{" "} 
                      <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
                        Forgot Password
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;