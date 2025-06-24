import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { usePermission } from '../utils/usePermission';
import PermissionLink from './PermissionLink';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const {setAuthUser} = useAuth();
  const [query, setQuery] = useState('');
  const [techOpen, setTechOpen] = useState(false);
  const navigate = useNavigate();
  const { hasPermission, loading } = usePermission(); // centralized permission check

  const handleLogout = async () => {
    localStorage.removeItem('authUser');
    setAuthUser(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to log out');
      }
  
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  const handleAccount = () => {
    navigate(`/account`)
  }

  const userpage = () => {
    navigate('/users');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={`sidebar ${theme}`}>
      <div className="sidebar-header">
        <h4>Staff Portal</h4>

      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search globally..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <svg className="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h6>General</h6>
          <ul>
            <li>
              <Link to="/dashboard">
                <svg viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/players">
                <svg viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Players
              </Link>
            </li>
            <li>
              <Link to="/recent">
                <svg viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
                Recently Edited
              </Link>
            </li>
            <li>
              <Link to="/requests">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                Requests
              </Link>
            </li>
            <li>
              <Link to="/bugs">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 0c53 0 96 43 96 96l0 3.6c0 15.7-12.7 28.4-28.4 28.4l-135.1 0c-15.7 0-28.4-12.7-28.4-28.4l0-3.6c0-53 43-96 96-96zM41.4 105.4c12.5-12.5 32.8-12.5 45.3 0l64 64c.7 .7 1.3 1.4 1.9 2.1c14.2-7.3 30.4-11.4 47.5-11.4l112 0c17.1 0 33.2 4.1 47.5 11.4c.6-.7 1.2-1.4 1.9-2.1l64-64c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-64 64c-.7 .7-1.4 1.3-2.1 1.9c6.2 12 10.1 25.3 11.1 39.5l64.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c0 24.6-5.5 47.8-15.4 68.6c2.2 1.3 4.2 2.9 6 4.8l64 64c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-63.1-63.1c-24.5 21.8-55.8 36.2-90.3 39.6L272 240c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 239.2c-34.5-3.4-65.8-17.8-90.3-39.6L86.6 502.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l64-64c1.9-1.9 3.9-3.4 6-4.8C101.5 367.8 96 344.6 96 320l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64.3 0c1.1-14.1 5-27.5 11.1-39.5c-.7-.6-1.4-1.2-2.1-1.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3z"/>
                </svg>
                Bug Reports
              </Link>
            </li>
            <li>
              <Link to="/warps">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 398.8c-11.8 5.1-23.4 9.7-34.9 13.5c16.7 33.8 31 35.7 34.9 35.7s18.1-1.9 34.9-35.7c-11.4-3.9-23.1-8.4-34.9-13.5zM446 256c33 45.2 44.3 90.9 23.6 128c-20.2 36.3-62.5 49.3-115.2 43.2c-22 52.1-55.6 84.8-98.4 84.8s-76.4-32.7-98.4-84.8c-52.7 6.1-95-6.8-115.2-43.2C21.7 346.9 33 301.2 66 256c-33-45.2-44.3-90.9-23.6-128c20.2-36.3 62.5-49.3 115.2-43.2C179.6 32.7 213.2 0 256 0s76.4 32.7 98.4 84.8c52.7-6.1 95 6.8 115.2 43.2c20.7 37.1 9.4 82.8-23.6 128zm-65.8 67.4c-1.7 14.2-3.9 28-6.7 41.2c31.8 1.4 38.6-8.7 40.2-11.7c2.3-4.2 7-17.9-11.9-48.1c-6.8 6.3-14 12.5-21.6 18.6zm-6.7-175.9c2.8 13.1 5 26.9 6.7 41.2c7.6 6.1 14.8 12.3 21.6 18.6c18.9-30.2 14.2-44 11.9-48.1c-1.6-2.9-8.4-13-40.2-11.7zM290.9 99.7C274.1 65.9 259.9 64 256 64s-18.1 1.9-34.9 35.7c11.4 3.9 23.1 8.4 34.9 13.5c11.8-5.1 23.4-9.7 34.9-13.5zm-159 88.9c1.7-14.3 3.9-28 6.7-41.2c-31.8-1.4-38.6 8.7-40.2 11.7c-2.3 4.2-7 17.9 11.9 48.1c6.8-6.3 14-12.5 21.6-18.6zM110.2 304.8C91.4 335 96 348.7 98.3 352.9c1.6 2.9 8.4 13 40.2 11.7c-2.8-13.1-5-26.9-6.7-41.2c-7.6-6.1-14.8-12.3-21.6-18.6zM336 256a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zm-80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                </svg>
                Warps
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <div className="gd-title">
            <h6 
              onClick={() => setTechOpen(!techOpen)}
            >Game Design</h6>
            <button 
              className="nav-toggle" 
              onClick={() => setTechOpen(!techOpen)}
              aria-expanded={techOpen}
            > {techOpen ? '−' : '+'}
              {/* No text needed - using CSS pseudo-element */}
            </button>
          </div>
          {techOpen && (
            <ul className="submenu">
              <PermissionLink to="/channels" label="Channels" perm="CHANNEL_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/citems" label="Citems" perm="CITEM_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/fishing" label="Fishing" perm="FISHING_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/recipes" label="Recipes" perm="RECIPE_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/cooldowns" label="Cooldowns" perm="COOLDOWN_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/cosmetics" label="Cosmetics" perm="COSMETIC_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/currencies" label="Currencies" perm="CURRENCY_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/guis" label="GUIs" perm="GUI_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/interactions" label="Interactions" perm="INTERACTION_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/loottables" label="Loot Tables" perm="LOOTTABLE_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/professions" label="Professions" perm="PROFESSION_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/stats" label="Stats" perm="STATS_VIEW" hasPermission={hasPermission} loading={loading} />
              <PermissionLink to="/unlockables" label="Unlockables" perm="UNLOCKABLE_VIEW" hasPermission={hasPermission} loading={loading} />
            </ul>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        {hasPermission('ADMIN') && (
          <button className="admin-btn" onClick={userpage}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Administration
          </button>
        )}
        
        <div className="footer-buttons-row">
          <button 
            onClick={handleAccount}
            className="account-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
            </svg>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
          <button 
            onClick={toggleTheme}
            className="theme-toggle-icon"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;