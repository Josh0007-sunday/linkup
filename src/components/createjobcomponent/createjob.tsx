import React, { useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Keypair, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, BN } from '@project-serum/anchor';
import idl from './web3/idl.json';
import CreateJobListing from './createjoblisting';

const programId = new PublicKey('6M18Rahd9HKnzK7c7fk6zXASgZYjPnGwaivQsRRJGb1h');

const getProgram = (wallet: any, connection: any) => {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: 'processed', commitment: 'processed' }
  );
  return new Program(idl as Idl, programId, provider);
};

interface JobListing {
  creator: PublicKey;
  projectName: string;
  position: string;
  description: string;
  time: number; // Unix timestamp
  applyUrl: string;
  status: string;
}

const JobListingApp: React.FC = () => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anchorWallet = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions || !connection) {
      return null;
    }
    return {
      publicKey,
      signTransaction: async (transaction: Transaction) => {
        return await signTransaction(transaction);
      },
      signAllTransactions: async (transactions: Transaction[]) => {
        return await signAllTransactions(transactions);
      },
    };
  }, [publicKey, signTransaction, signAllTransactions, connection]);

  const fetchJobListings = async () => {
    if (!anchorWallet || !connection) return;
    try {
      const program = getProgram(anchorWallet, connection);
      const listings = await program.account.jobListing.all();
      // Filter job listings created by the connected wallet
      const filteredListings = listings
        .filter((listing) => listing.account.creator.equals(publicKey))
        .map((listing) => listing.account as JobListing);
      setJobListings(filteredListings);
    } catch (err) {
      console.error('Error fetching job listings:', err);
    }
  };

  useEffect(() => {
    if (anchorWallet && connection) {
      fetchJobListings();
    }
  }, [anchorWallet, connection]);

  const handleCreateJobListing = async (formData: {
    projectName: string;
    position: string;
    description: string;
    time: number;
    applyUrl: string;
  }) => {
    if (!publicKey || !anchorWallet || !connection) {
      setError('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const program = getProgram(anchorWallet, connection);
      const jobListingAccount = Keypair.generate();
      const timeBN = new BN(formData.time);

      await program.methods
        .createJobListing(
          formData.projectName,
          formData.position,
          formData.description,
          timeBN,
          formData.applyUrl
        )
        .accounts({
          jobListing: jobListingAccount.publicKey,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([jobListingAccount])
        .rpc();

      alert('Job listing created successfully!');
      await fetchJobListings();
    } catch (err: any) {
      console.error('Error creating job listing:', err);
      setError(err.message || 'Failed to create job listing');
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer logic
  const calculateTimeLeft = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const difference = endTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (60 * 60 * 24));
    const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((difference % (60 * 60)) / 60);
    const seconds = Math.floor(difference % 60);

    return { days, hours, minutes, seconds };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="p-4 max-w-4xl mx-auto">

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Create Job Listing Form */}
        <CreateJobListing onCreateJobListing={handleCreateJobListing} isLoading={isLoading} />

        {/* Display Job Listings */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Recommended Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobListings.map((listing, index) => {
              const { days, hours, minutes, seconds } = calculateTimeLeft(listing.time);

              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-400">B</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {listing.projectName}
                      </h3>
                      <p className="text-sm text-gray-600">{listing.position}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">Remote</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">
                        {days > 0 || hours > 0 || minutes > 0 || seconds > 0
                          ? `${days}d ${hours}h ${minutes}m ${seconds}s`
                          : 'Expired'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href={listing.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListingApp;