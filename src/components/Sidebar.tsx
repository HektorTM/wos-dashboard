import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [techOpen, setTechOpen] = useState(false);
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

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
        <h4>Admin Dashboard</h4>
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
              <Link to="/under-review">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                Under Review
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <h6>Tech</h6>
          <button className="nav-toggle" onClick={() => setTechOpen(!techOpen)}>
            {techOpen ? '▲' : '▼'}
          </button>
          {techOpen && (
            <ul className="submenu">
              <li>
                <Link to="/citems">Custom Items</Link>
              </li>
              <li>
                <Link to="/cooldowns">Cooldowns</Link>
              </li>
              <li>
                <Link to="/cosmetics">Cosmetics</Link>
              </li>
              <li>
                <Link to="/currencies">Currencies</Link>
              </li>
              <li>
                <Link to="/guis">GUIs</Link>
              </li>
              <li>
                <Link to="/interactions">Interactions</Link>
              </li>
              <li>
                <Link to="/loottables">Loot Tables</Link>
              </li>
              <li>
                <Link to="/professions">Professions</Link>
              </li>
              <li>
                <Link to="/stats">Stats</Link>
              </li>
              <li>
                <Link to="/unlockables">Unlockables</Link>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="admin-btn"  onClick={userpage}>
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          Administration
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Logout
        </button>
        <button 
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;