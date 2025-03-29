// import { useState, FormEvent, ChangeEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';

// interface ForumData {
//   name: string;
//   description: string;
//   isPublic: boolean;
// }

// const CreateForum = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState<ForumData>({
//     name: "",
//     description: "",
//     isPublic: true, // Default to public forum
//   });

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     setData({
//       ...data,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
//     });
//   };

//   const createForum = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const API_BASE_URL = import.meta.env.VITE_CONNECTION;
//       const token = localStorage.getItem('auth-token'); // Correct token key

//       if (!token) {
//         toast.error("You are not authenticated. Please log in.", {
//           style: {
//             background: '#FFEBEE',
//             color: '#D32F2F',
//             border: '1px solid #FFCDD2',
//             padding: '16px',
//             borderRadius: '8px',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//           },
//           iconTheme: {
//             primary: '#D32F2F',
//             secondary: '#FFEBEE',
//           },
//         });
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/create-forum`, data, {
//         headers: {
//           'x-auth-token': token, // Correct token key
//         },
//       });

//       const responseData = response.data;

//       if (responseData.error) {
//         toast.error(responseData.error, {
//           style: {
//             background: '#FFEBEE',
//             color: '#D32F2F',
//             border: '1px solid #FFCDD2',
//             padding: '16px',
//             borderRadius: '8px',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//           },
//           iconTheme: {
//             primary: '#D32F2F',
//             secondary: '#FFEBEE',
//           },
//         });
//       } else {
//         setData({
//           name: "",
//           description: "",
//           isPublic: true,
//         });
//         toast.success("Forum created successfully!", {
//           style: {
//             background: '#E8F5E9',
//             color: '#2E7D32',
//             border: '1px solid #C8E6C9',
//             padding: '16px',
//             borderRadius: '8px',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//           },
//           iconTheme: {
//             primary: '#2E7D32',
//             secondary: '#E8F5E9',
//           },
//         });
//         navigate("/view-forum"); 
//       }
//     } catch (error) {
//       console.error("Error creating forum:", error);
//       toast.error("An error occurred while creating the forum. Please try again.", {
//         style: {
//           background: '#FFEBEE',
//           color: '#D32F2F',
//           border: '1px solid #FFCDD2',
//           padding: '16px',
//           borderRadius: '8px',
//           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//         },
//         iconTheme: {
//           primary: '#D32F2F',
//           secondary: '#FFEBEE',
//         },
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
//       {/* Toast Notifications */}
//       <Toaster
//         position="top-center"
//         reverseOrder={false}
//         toastOptions={{
//           duration: 3000,
//           success: {
//             style: {
//               background: '#E8F5E9',
//               color: '#2E7D32',
//               border: '1px solid #C8E6C9',
//               padding: '16px',
//               borderRadius: '8px',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//             },
//             iconTheme: {
//               primary: '#2E7D32',
//               secondary: '#E8F5E9',
//             },
//           },
//           error: {
//             style: {
//               background: '#FFEBEE',
//               color: '#D32F2F',
//               border: '1px solid #FFCDD2',
//               padding: '16px',
//               borderRadius: '8px',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//             },
//             iconTheme: {
//               primary: '#D32F2F',
//               secondary: '#FFEBEE',
//             },
//           },
//         }}
//       />

//       {/* Form Container */}
//       <div className="w-full max-w-2xl">
//         {/* Logo/Brand Section */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Create Forum</h1>
//           <p className="text-gray-600 mt-2">Start a new discussion with your community</p>
//         </div>

//         {/* Forum Creation Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
//           <form onSubmit={createForum} className="space-y-6">
//             {/* Forum Name */}
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//                 Forum Name
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 required
//                 value={data.name}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
//                 placeholder="Enter forum name"
//               />
//             </div>

//             {/* Description */}
//             <div>
//               <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
//                 Description
//               </label>
//               <textarea
//                 id="description"
//                 name="description"
//                 required
//                 value={data.description}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
//                 placeholder="Enter forum description"
//               />
//             </div>

//             {/* Visibility (Public/Private) */}
//             <div className="flex items-center">
//               <input
//                 id="isPublic"
//                 name="isPublic"
//                 type="checkbox"
//                 checked={data.isPublic}
//                 onChange={handleInputChange}
//                 className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
//               />
//               <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
//                 Make this forum public
//               </label>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full py-3 px-4 rounded-lg text-white font-medium
//                 ${loading 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-gray-700 hover:bg-gray-800 active:bg-gray-800'} 
//                 transition-colors duration-200`}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating forum...
//                 </span>
//               ) : (
//                 'Create Forum'
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateForum;



import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

interface ForumData {
  name: string;
  description: string;
  isPublic: boolean;
  imageUri: string;
}

const CreateForum = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ForumData>({
    name: "",
    description: "",
    isPublic: true, // Default to public forum
    imageUri: "", // Add imageUri field
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setData({
      ...data,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const createForum = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_CONNECTION;
      const token = localStorage.getItem('auth-token');

      if (!token) {
        toast.error("You are not authenticated. Please log in.", {
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
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/create-forum`,
        { ...data },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

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
          name: "",
          description: "",
          isPublic: true,
          imageUri: "",
        });
        toast.success("Forum created successfully!", {
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
        navigate("/view-forum");
      }
    } catch (error) {
      console.error("Error creating forum:", error);
      toast.error("An error occurred while creating the forum. Please try again.", {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          success: {
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
          },
          error: {
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
          },
        }}
      />

      {/* Form Container */}
      <div className="w-full max-w-2xl">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Forum</h1>
          <p className="text-gray-600 mt-2">Start a new discussion with your community</p>
        </div>

        {/* Forum Creation Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={createForum} className="space-y-6">
            {/* Forum Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Forum Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={data.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter forum name"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={data.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter forum description"
              />
            </div>

            {/* Forum Image URI */}
            <div>
              <label htmlFor="imageUri" className="block text-sm font-medium text-gray-700 mb-2">
                Forum Image URI
              </label>
              <input
                id="imageUri"
                name="imageUri"
                type="text"
                value={data.imageUri}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Enter image URI"
              />
              {data.imageUri && (
                <div className="mt-4">
                  <img
                    src={data.imageUri}
                    alt="Forum Preview"
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            {/* Visibility (Public/Private) */}
            <div className="flex items-center">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                checked={data.isPublic}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                Make this forum public
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-800 active:bg-gray-800'} 
                transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating forum...
                </span>
              ) : (
                'Create Forum'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateForum;