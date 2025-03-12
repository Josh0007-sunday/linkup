const Recommendation: React.FC = () => {
  const jobs = [
    { title: "UI/UX Designer", company: "Black Technologies", location: "San Francisco", type: "Onsite", level: "Expert", employment: "Full Time" },
    { title: "Product Designer", company: "GoTo Corp", location: "Jakarta, ID", type: "Onsite", level: "Expert", employment: "Full Time" },
    { title: "UX Researcher", company: "Loom", location: "San Francisco", type: "Hybrid", level: "Entry Level", employment: "Part Time" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Job Recommendations</h2>
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
            <p className="text-gray-600">{job.company} - {job.location}</p>
            <p className="text-gray-600">{job.type} | {job.level} | {job.employment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendation;