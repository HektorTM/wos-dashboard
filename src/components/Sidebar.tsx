// Sidebar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useState } from 'react';

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const [techOpen, setTechOpen] = useState(false); // for dropdown
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  }

  return (
    <div
      className={`d-flex flex-column ${theme === 'light' ? 'bg-light' : 'bg-dark'} text-${
        theme === 'light' ? 'dark' : 'light'
      }`}
      style={{ width: '250px', height: '100vh', paddingTop: '1rem' }}
    >
      <div className="px-4 mb-3">
        <h4>Admin Dashboard</h4>
      </div>

      {/* General Section */}
      <div className="px-3">
        <h6 className="text-muted">General</h6>
        <ul className="nav flex-column">
        <li className="nav-item mb-1">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/players" className="nav-link">
              Players
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/recent" className="nav-link">
              Recently Edited
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/under-review" className="nav-link">
              Under Review
            </Link>
          </li>
        </ul>
      </div>

      {/* Tech Section */}
      <div className="px-3 mt-3">
        <h6 className="text-muted">Tech</h6>
        <button
          className="btn btn-sm btn-outline-secondary w-100 mb-2 text-start"
          onClick={() => setTechOpen(!techOpen)}
        >
          Tech {techOpen ? '▲' : '▼'}
        </button>
        {techOpen && (
          <ul className="nav flex-column ms-3">
            <li className="nav-item mb-1">
              <Link to="/citems" className="nav-link">
                Citems
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/cooldowns" className="nav-link">
                Cooldowns
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/cosmetics" className="nav-link">
                Cosmetics
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/currencies" className="nav-link">
                Currencies
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/guis" className="nav-link">
                GUIs
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/interactions" className="nav-link">
                Interactions
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/loottables" className="nav-link">
                Loottables
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/professions" className="nav-link">
                Professions
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/stats" className="nav-link">
                Stats
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/unlockables" className="nav-link">
                Unlockables
              </Link>
            </li>
            
            
            {/* Add more tech links here */}
          </ul>
        )}
      </div>
      
      {/* Spacer */}
      <div className="flex-grow-1"></div>
      
      {/* Admin + Logout */}
      <div className="px-4 pb-3">
        <Link to="/admin/users" className="btn btn-outline-primary w-100 mb-2">Administration</Link>
        <button className="btn btn-outline-danger w-100" onClick={handleLogout}>Logout</button>
      </div>
      
      {/* Theme Toggle */}
      <div className="mt-auto px-4 pb-4">
        <button className="btn btn-secondary w-100" onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
