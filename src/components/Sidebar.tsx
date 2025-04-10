// Sidebar.tsx
import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext'; // Import the useTheme hook

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme(); // Access theme state and toggle function

  return (
    <div
      className={`d-flex flex-column ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}
      style={{ width: '250px', height: '100vh' }}
    >
      <div className="p-4">
        <h4>Admin Dashboard</h4>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/currencies" className="nav-link">Currencies</Link>
        </li>
        <li className="nav-item">
          <Link to="/currencies/create" className="nav-link">Create Currency</Link>
        </li>
        <li className="nav-item">
          <Link to="/otherpage" className="nav-link">Other Page</Link>
        </li>
      </ul>
      {/* Toggle Button */}
      <div className="p-4">
        <button className="btn btn-secondary" onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
