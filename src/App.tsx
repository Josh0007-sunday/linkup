import { BrowserRouter as Router, Route, Routes, useLocation, Outlet } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import SignUp from './components/Signup';
import Login from './components/Login';
import Recommendation from './components/Recommendation';
import Profile from './components/Profile';
import Home from './pages/Home';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AUTH/page';
import UpdateProfile from './pages/Updateprofile';
import CreateService from './components/CreateServices';
import ServiceList from './pages/ListedService';
import { WalletProvider } from './walletadapter/adapter';
import JobListingApp from './components/createjobcomponent/createjob';
import ViewAllJobs from './pages/viewpage/ViewAllJobs';
import ViewAllUsers from './pages/viewpage/ViewAllUsers';
import ViewAllMarketingPitches from './pages/viewpage/ViewAllMarketingPitches';
import JobDetail from './pages/viewpage/main/JobDetail';
import UserDetail from './pages/viewpage/main/UserDetail';
import MarketingPitchDetail from './pages/viewpage/main/MarketingPitchDetail';
import ProtectedRoute from './utils/protectedRoutes';
import BountyList from './pages/bounties';
import BountyDetails from './pages/viewbounty/page';
import UserOnboarding from './pages/onboarding/page';
import VerificationPage from './pages/VerifyEmail';
import ForgotPassword from './components/forgotpassword/page';
import ResetPassword from './components/forgotpassword/resetroute/page';
import CreateForum from './components/forum/page';
import ViewAllForums from './components/forum/viewallforum/page';
import ForumDiscussion from './components/forum/viewallforum/forumdiscussion/page';
import { HuddleClient, HuddleProvider } from '@huddle01/react';
import VideoCall from './components/videocall/page';
import CreateArticle from './pages/articles/createArticle';
import ArticleView from './pages/articles/articlecomponent/viewArticle';
import ViewAllArticles from './pages/viewpage/viewAllArticles';
import ArticleDetail from './pages/viewpage/main/articleDetail';
// import SendTokens from './components/withdraw';


const huddleClient = new HuddleClient({
  projectId: '2dkFPqrEKGMGO9iFR0nvZnlv7kU72R9e',
  options: {
    activeSpeakers: {
      size: 12,
    },
  },
});

const App: React.FC = () => {
  axios.defaults.baseURL = import.meta.env.VITE_CONNECTION;
  axios.defaults.withCredentials = false;

  return (
    <WalletProvider>
      <Router>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <AppContent />
      </Router>
    </WalletProvider>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();

  // Define routes where the Navbar should NOT be shown
  const noNavbarRoutes = ['/', '/signup', '/onboarding'];
  const noNavbarPrefixRoutes = ['/verify-email', '/forgot-password', '/reset-password', '/forum'];

  // Check if the current route matches any noNavbarRoutes or starts with any noNavbarPrefixRoutes
  const shouldShowNavbar = !(
    noNavbarRoutes.includes(location.pathname) ||
    noNavbarPrefixRoutes.some(route => location.pathname.startsWith(route))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <HuddleProvider client={huddleClient}>
      <AuthProvider>
        {/* Conditionally render the Navbar */}
        {shouldShowNavbar && <Navbar />}

        <Routes>
          {/* Public Routes (No Navbar) */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={<UserOnboarding />} />
          <Route path="/verify-email/:token" element={<VerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/meeting" element={<VideoCall />} />
          

          {/* Protected Routes (With Navbar) */}
          <Route
            element={
              <ProtectedRoute>
                <Outlet /> {/* Render nested routes here */}
              </ProtectedRoute>
            }
          >
            {/* <Route path="/send-tokens" element={<SendTokens />} /> */}
            <Route path="/homepage" element={<Home />} />
            <Route path="/recommendation" element={<Recommendation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/services" element={<CreateService />} />
            <Route path="/serviceList" element={<ServiceList />} />
            <Route path="/joblisting" element={<JobListingApp />} />
            <Route path="/viewpage/jobs" element={<ViewAllJobs />} />
            <Route path="/viewpage/users" element={<ViewAllUsers />} />
            <Route path="/viewpage/marketing-pitches" element={<ViewAllMarketingPitches />} />
            <Route path="/main/jobdetails/:id" element={<JobDetail />} />
            <Route path="/main/userdetails/:id" element={<UserDetail />} />
            <Route path="/main/marketingdetails/:id" element={<MarketingPitchDetail />} />
            <Route path="/bounties" element={<BountyList />} />
            <Route path="/bounties/:id" element={<BountyDetails />} />
            <Route path="/create-forum" element={<CreateForum />} />
            <Route path="/view-forum" element={<ViewAllForums />} />
            <Route path="/:forumId/message" element={<ForumDiscussion/>} />
            <Route path="/write" element={<CreateArticle/>} />
            <Route path="/article/:id" element={<ArticleView />} />
            <Route path="/articles" element={<ViewAllArticles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            {/* <Route path="/meeting" element={<VideoCall />} /> */}
          </Route>
        </Routes>
      </AuthProvider>
      </HuddleProvider>
    </div>
  );
};

export default App;