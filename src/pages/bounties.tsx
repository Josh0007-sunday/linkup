import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle, Clock, Award, Tag as TagIcon } from "lucide-react";
import BountyCarousel from "./addon/BountyCarousel";

interface Bounty {
  _id: string;
  title: string;
  tag: string;
  status: string;
  total_prizes: number;
  details: string;
  prizes: number[];
  duration: string;
  createdAt: string;
}

const BountyList: React.FC = () => {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBounties = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_CONNECTION;
      const response = await axios.get(`${API_BASE_URL}/getbounties`);
      setBounties(response.data);
    } catch (error) {
      console.error("Error fetching bounties:", error);
      toast.error("Failed to fetch bounties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black">
        <div className="animate-pulse w-16 h-16 bg-purple-500/20 rounded-full border border-purple-500/20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black text-gray-100">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            backdropFilter: 'blur(8px)',
          },
        }}
      />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BountyCarousel bounties={bounties} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bounty List */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
              Open Bounties
            </h2>
            <div className="space-y-4">
              {bounties.map((bounty) => (
                <div 
                  key={bounty._id} 
                  className="bg-gray-900/30 backdrop-blur-xl rounded-xl border border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/bounties/${bounty._id}`)}
                >
                  <div className="p-5 flex items-center justify-between h-28">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-500/10 p-3 rounded-full border border-purple-500/20">
                        <Award className="text-purple-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-400 mb-1">{bounty.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-300 mb-1">
                          <TagIcon size={16} className="text-purple-400" />
                          <span>{bounty.tag}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Clock size={16} className="text-purple-400" />
                          <span>Due in {bounty.duration}</span>
                          <span className="text-purple-400">•</span>
                          <span className="font-medium text-purple-400">{bounty.total_prizes} USDC</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-purple-400" size={24} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-gray-900/30 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">Getting Started</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-purple-400" size={24} />
                  <span className="text-gray-300">Create your profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-purple-400" size={24} />
                  <span className="text-gray-300">Explore available bounties</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="text-purple-400" size={24} />
                  <span className="text-gray-300">Start your first project</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BountyList;