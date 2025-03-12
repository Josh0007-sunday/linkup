import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <div className={`bg-white text-black w-64 space-y-4 p-4 fixed h-full transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
      <Link to="/" className="block">Home</Link>
      <Link to="/jobs" className="block">Jobs</Link>
      <Link to="/resume-builder" className="block">Resume Builder</Link>
      <Link to="/contact" className="block">Contact</Link>
      <Link to="/companies" className="block">Companies</Link>
      <Link to="/employees" className="block">Employees</Link>
      <Link to="/referral" className="block">Referral</Link>
      <Link to="/support-center" className="block">Support Center</Link>
      <Link to="/settings" className="block">Settings</Link>
    </div>
  );
};

export default Sidebar;