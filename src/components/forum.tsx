// import { useNavigate } from "react-router-dom";
// import { useState } from "react";

// const ForumDiscussion = () => {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="min-h-screen bg-white text-gray-800 flex flex-col h-screen">
//       {/* Header */}
//       <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
//         <div className="flex items-center">
//           <button 
//             onClick={() => navigate("/homepage")}
//             className="mr-4 text-gray-500 hover:text-gray-700"
//           >
//             ← Back
//           </button>
//           <h1 className="text-xl font-medium">Designer</h1>
//           <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Beta</span>
//         </div>
//         <div className="flex items-center">
//           <button className="p-2 text-gray-500 hover:text-gray-700">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//             </svg>
//           </button>
//           <button className="p-2 ml-2 text-gray-500 hover:text-gray-700">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//             </svg>
//           </button>
//           <button 
//             onClick={toggleSidebar}
//             className="p-2 ml-2 text-gray-500 hover:text-gray-700 md:hidden"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* Main content area */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Messages area */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Messages container */}
//           <div className="flex-1 overflow-y-auto p-4">
//             <div className="space-y-6">
//               {/* Sample message 1 */}
//               <div className="flex">
//                 <div className="mr-4">
//                   <img 
//                     src="https://via.placeholder.com/40" 
//                     alt="Ben Ten" 
//                     className="w-10 h-10 rounded-full"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center mb-1">
//                     <span className="font-medium text-gray-900">Ben Ten</span>
//                     <span className="text-sm text-gray-500 ml-2">11:59 AM</span>
//                   </div>
//                   <div className="text-gray-700 mb-2">
//                     Hi everyone, can we get an update on the progress of the web design project?
//                   </div>
//                 </div>
//               </div>

//               {/* Sample message 2 with attachment */}
//               <div className="flex">
//                 <div className="mr-4">
//                   <img 
//                     src="https://via.placeholder.com/40" 
//                     alt="Mark Roll" 
//                     className="w-10 h-10 rounded-full"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center mb-1">
//                     <span className="font-medium text-gray-900">Mark Roll</span>
//                     <span className="text-sm text-gray-500 ml-2">11:27 AM</span>
//                   </div>
//                   <div className="text-gray-700 mb-2">
//                     Sure! I've attached a Figma file that shows the landing page design and some of the inner pages that I've been working on. Take a look and let me know if you have any feedback.
//                   </div>
                  
//                   <div className="mb-3 bg-gray-50 p-3 rounded border border-gray-200">
//                     <div className="text-sm font-medium mb-1">Meriaki - Interior Design Landing Page</div>
//                     <a href="#" className="text-blue-600 hover:underline text-sm block mb-2">https://www.figma.com/file/7HBVnEgYKT54IUKews9Nu2/Interior-Design-Landing-Page...</a>
//                     <img 
//                       src="https://via.placeholder.com/400x150" 
//                       alt="Design preview" 
//                       className="w-full rounded"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Sample message 3 */}
//               <div className="flex">
//                 <div className="mr-4">
//                   <img 
//                     src="https://via.placeholder.com/40" 
//                     alt="Rico Fernandez" 
//                     className="w-10 h-10 rounded-full"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center mb-1">
//                     <span className="font-medium text-gray-900">Rico Fernandez</span>
//                     <span className="text-sm text-gray-500 ml-2">11:35 AM</span>
//                   </div>
//                   <div className="text-gray-700 mb-2">
//                     I've been working on the mobile design and I'm almost finished with that. I'll send over a file in just a few minutes so you can take a look.
//                   </div>
//                 </div>
//               </div>

//               {/* Sample message 4 */}
//               <div className="flex">
//                 <div className="mr-4">
//                   <img 
//                     src="https://via.placeholder.com/40" 
//                     alt="Ben Ten" 
//                     className="w-10 h-10 rounded-full"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center mb-1">
//                     <span className="font-medium text-gray-900">Ben Ten</span>
//                     <span className="text-sm text-gray-500 ml-2">01:12 PM</span>
//                   </div>
//                   <div className="text-gray-700 mb-2">
//                     Thanks for the update, @Mark Roll! How much more work do you think you have left to do?
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Input area */}
//           <div className="p-4 border-t border-gray-200">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Message..."
//                 className="w-full bg-gray-100 text-gray-800 px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
//               />
//               <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex">
//                 <button className="p-2 text-gray-500 hover:text-gray-700">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//                 <button className="p-2 text-gray-500 hover:text-gray-700 ml-1">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5V5.5A.5.5 0 014 5h12a.5.5 0 01.5.5v9a.5.5 0 01-.5.5z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//                 <button 
//                   className="ml-1 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Sidebar - Twitter Space style */}
//         <div className={`w-80 bg-gray-50 border-l border-gray-200 p-4 fixed md:static right-0 top-0 bottom-0 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} z-10 overflow-y-auto`}>
//           <div className="flex justify-between items-center mb-6 md:hidden">
//             <h2 className="text-xl font-medium">Details</h2>
//             <button 
//               onClick={toggleSidebar}
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="mb-6">
//             <h3 className="text-lg font-medium mb-2">Description</h3>
//             <p className="text-gray-600 text-sm">
//               Main discussion of about design project (web, mobile, illustration, social media posts, etc). We talk, we think, we grow together.
//             </p>
//           </div>
          
//           <div className="mb-6">
//             <h3 className="text-lg font-medium mb-4 flex items-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//               </svg>
//               Members
//             </h3>
//             <div className="space-y-4">
//               <div className="flex items-center">
//                 <img src="https://via.placeholder.com/40" alt="Member" className="w-10 h-10 rounded-full mr-3" />
//                 <div>
//                   <p className="font-medium">Mark Roll</p>
//                   <p className="text-xs text-gray-500">Creative Director</p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <img src="https://via.placeholder.com/40" alt="Member" className="w-10 h-10 rounded-full mr-3" />
//                 <div>
//                   <p className="font-medium">Ben Ten</p>
//                   <p className="text-xs text-gray-500">UI/UX Designer</p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <img src="https://via.placeholder.com/40" alt="Member" className="w-10 h-10 rounded-full mr-3" />
//                 <div>
//                   <p className="font-medium">Rico Fernandez</p>
//                   <p className="text-xs text-gray-500">UI/UX Designer</p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <img src="https://via.placeholder.com/40" alt="Member" className="w-10 h-10 rounded-full mr-3" />
//                 <div>
//                   <p className="font-medium">Marco Asensio</p>
//                   <p className="text-xs text-gray-500">Graphic Designer</p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <img src="https://via.placeholder.com/40" alt="Member" className="w-10 h-10 rounded-full mr-3" />
//                 <div>
//                   <p className="font-medium">Esther Howard</p>
//                   <p className="text-xs text-gray-500">Illustrator</p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <img src="https://via.placeholder.com/40" alt="Member" className="w-10 h-10 rounded-full mr-3" />
//                 <div>
//                   <p className="font-medium">Dianne Russell</p>
//                   <p className="text-xs text-gray-500">UI/UX Designer</p>
//                 </div>
//               </div>
//               <button className="flex items-center text-gray-700 hover:text-gray-900 mt-2">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//                 </svg>
//                 Add Members
//               </button>
//             </div>
            
//             {/* Twitter Space-like Start button */}
//             <button className="mt-6 w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
//               </svg>
//               Start Space
//             </button>
//           </div>
          
//           <div className="mb-6">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-medium flex items-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                 </svg>
//                 Notifications
//               </h3>
//               <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                 <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer" checked />
//                 <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-400 cursor-pointer"></label>
//               </div>
//             </div>
//           </div>
          
//           <div className="mb-6">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-medium flex items-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
//                 </svg>
//                 Starred
//               </h3>
//               <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                 <input type="checkbox" name="starred" id="starred" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer" checked />
//                 <label htmlFor="starred" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-400 cursor-pointer"></label>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForumDiscussion;