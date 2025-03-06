import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive(to)
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 px-4 py-2 sm:py-0">
          <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
            <Link 
              to="/admin" 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-blue-300 transition-all duration-200"
            >
              Admin Portal
            </Link>
            
            {/* Mobile menu button */}
            <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <NavLink to="/admin/causes">Causes</NavLink>
              <NavLink to="/admin/categories">Categories</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
            </div>
            
            <Button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 mt-2 sm:mt-0 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 