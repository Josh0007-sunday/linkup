import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle, Clock, Award, Tag as TagIcon } from 'lucide-react';

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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-pulse w-16 h-16 bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900">
      <Toaster position="top-center" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bounty List */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Open Bounties</h2>
            <div className="space-y-4">
              {bounties.map((bounty) => (
                <div 
                  key={bounty._id} 
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/bounties/${bounty._id}`)}
                >
                  <div className="p-5 flex items-center justify-between h-28">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <Award className="text-gray-700" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{bounty.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                          <TagIcon size={16} className="text-gray-400" />
                          <span>{bounty.tag}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock size={16} />
                          <span>Due in {bounty.duration}</span>
                          <span>•</span>
                          <span className="font-medium text-gray-700">{bounty.total_prizes} USDC</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={24} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Getting Started</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={24} />
                  <span className="text-gray-700">Create your profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={24} />
                  <span className="text-gray-700">Explore available bounties</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="text-gray-700" size={24} />
                  <span className="text-gray-700">Start your first project</span>
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