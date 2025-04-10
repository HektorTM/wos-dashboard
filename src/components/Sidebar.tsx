import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-light p-3" style={{ minHeight: '100vh', width: '250px' }}>
      <h5>Staff Portal</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link to="/currencies" className="nav-link">Currencies</Link>
        </li>
        <li className="nav-item mt-3">
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
