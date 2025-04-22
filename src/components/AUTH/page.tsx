import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";


interface User {
  [x: string]: string;
  eth_publickey: string,
  xpNumber: string,
  privatekey: string,
  tiplinkUrl: string; 
  publicKey: string;
  img: string;
  portfolio: string;
  github_url: string;
  linkedin_url: string;
  facebook_url: string;
  twitter_url: string;
  bio: string;
  status: string;
  name: string;
  email: string;
  _id: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isLoading: true,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    const storedUser = localStorage.getItem("user");

    console.log("Stored Token:", token);
    console.log("Stored User:", storedUser);

    const checkTokenValidity = async () => {
      if (token) {
        try {
          const response = await axios.post("/tokenIsValid", null, {
            headers: { "x-auth-token": token },
          });

          console.log("Token Validity Response:", response.data);

          if (response.data === true && storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log("Setting user:", parsedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("auth-token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Token validation failed", error);
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkTokenValidity();
  }, []);

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};