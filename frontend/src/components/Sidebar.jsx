import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Settings, User, X, ChevronDown, ChevronRight, PlusSquare, Clock, CheckCircle, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isProjectActive = location.pathname.includes('/projects') && !location.pathname.includes('/projects/current');

  const navItemClasses = "flex items-start py-3.5 text-indigo-100/80 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 rounded-xl mx-3 mb-1 font-bold px-4";
  const activeClasses = "bg-white/20 text-white shadow-lg border border-white/10";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 bg-gradient-to-b from-[#4F46E5] to-[#3730A3] transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative md:translate-x-0 flex flex-col shadow-[20px_0_40px_-10px_rgba(0,0,0,0.1)] border-r border-indigo-400/20 overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isExpanded ? 'w-72' : 'w-20'}`}
      >
        {/* Fixed Header */}
        <div className={`flex items-center p-6 mb-2 relative overflow-hidden shrink-0 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {/* Decorative circle */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          {isExpanded && (
            <h2 className="text-2xl font-heading font-bold text-white tracking-wide relative z-10 whitespace-nowrap">
              Gnana<span className="text-indigo-200">Stack</span>
            </h2>
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className={`hidden md:block text-indigo-200 hover:text-white relative z-10 transition-transform ${!isExpanded ? 'mx-auto' : ''}`}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={24} />
          </button>
          
          <button onClick={toggleSidebar} className="md:hidden text-indigo-200 hover:text-white relative z-10">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => `${navItemClasses} ${isActive ? activeClasses : ''} ${isExpanded ? '' : 'justify-center'}`}
            title="Dashboard"
          >
            <LayoutDashboard size={20} className={isExpanded ? "mr-3 mt-0.5 shrink-0" : "shrink-0"} />
            {isExpanded && <span className="leading-tight">Dashboard</span>}
          </NavLink>

          <NavLink 
            to="/projects/current" 
            className={({isActive}) => `${navItemClasses} ${isActive ? activeClasses : ''} ${isExpanded ? '' : 'justify-center'}`}
            title="Project Management System"
          >
            <FolderKanban size={20} className={isExpanded ? "mr-3 mt-0.5 shrink-0" : "shrink-0"} />
            {isExpanded && <span className="leading-tight">Project Management System</span>}
          </NavLink>

          {/* Projects Dropdown */}
          <div className="mx-3 mb-1">
            <button 
              onClick={() => {
                if (!isExpanded) setIsExpanded(true);
                setProjectsOpen(!projectsOpen);
              }}
              className={`w-full flex items-start py-3.5 text-indigo-100/80 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 rounded-xl font-bold px-4 ${isProjectActive ? 'bg-white/10 text-white border border-white/5' : ''} ${isExpanded ? 'justify-between' : 'justify-center'}`}
              title="Projects"
            >
              <div className="flex items-start">
                <FolderKanban size={20} className={isExpanded ? "mr-3 mt-0.5 shrink-0" : "shrink-0"} />
                {isExpanded && <span className="leading-tight">Projects</span>}
              </div>
              {isExpanded && (
                projectsOpen ? <ChevronDown size={16} className="transition-transform duration-300 shrink-0 mt-1" /> : <ChevronRight size={16} className="transition-transform duration-300 shrink-0 mt-1" />
              )}
            </button>
            
            {/* Dropdown Items */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && (projectsOpen || isProjectActive) ? 'max-h-48 opacity-100 mt-2 space-y-1' : 'max-h-0 opacity-0 hidden'}`}>
              <NavLink 
                to="/projects/create" 
                className={({isActive}) => `flex items-center pl-12 pr-4 py-2.5 text-sm rounded-xl transition-all duration-300 font-bold ${isActive ? 'text-white bg-white/20 shadow-inner' : 'text-indigo-200/70 hover:text-white hover:bg-white/5'}`}
              >
                <PlusSquare size={16} className="mr-3 shrink-0" />
                <span className="whitespace-nowrap">Create Project</span>
              </NavLink>
              <NavLink 
                to="/projects/in-progress" 
                className={({isActive}) => `flex items-center pl-12 pr-4 py-2.5 text-sm rounded-xl transition-all duration-300 font-bold ${isActive ? 'text-white bg-white/20 shadow-inner' : 'text-indigo-200/70 hover:text-white hover:bg-white/5'}`}
              >
                <Clock size={16} className="mr-3 shrink-0" />
                <span className="whitespace-nowrap">In Progress</span>
              </NavLink>
              <NavLink 
                to="/projects/completed" 
                className={({isActive}) => `flex items-center pl-12 pr-4 py-2.5 text-sm rounded-xl transition-all duration-300 font-bold ${isActive ? 'text-white bg-white/20 shadow-inner' : 'text-indigo-200/70 hover:text-white hover:bg-white/5'}`}
              >
                <CheckCircle size={16} className="mr-3 shrink-0" />
                <span className="whitespace-nowrap">Completed</span>
              </NavLink>
            </div>
          </div>

          <NavLink 
            to="/settings" 
            className={({isActive}) => `${navItemClasses} ${isActive ? activeClasses : ''} ${isExpanded ? '' : 'justify-center'}`}
            title="Settings"
          >
            <Settings size={20} className={isExpanded ? "mr-3 mt-0.5 shrink-0" : "shrink-0"} />
            {isExpanded && <span className="leading-tight">Settings</span>}
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({isActive}) => `${navItemClasses} ${isActive ? activeClasses : ''} ${isExpanded ? '' : 'justify-center'}`}
            title="Profile"
          >
            <User size={20} className={isExpanded ? "mr-3 mt-0.5 shrink-0" : "shrink-0"} />
            {isExpanded && <span className="leading-tight">Profile</span>}
          </NavLink>
        </nav>

        {/* Fixed Footer (Logout) */}
        <div className="shrink-0 p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center py-3 text-red-200 hover:text-white hover:bg-red-500/20 backdrop-blur-sm transition-all duration-300 rounded-xl font-medium ${isExpanded ? 'px-4' : 'justify-center'}`}
            title="Logout"
          >
            <LogOut size={20} className={isExpanded ? "mr-3 shrink-0" : "shrink-0"} />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
