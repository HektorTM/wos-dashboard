import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample data - replace with real data


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your system.</p>
      </div>


      <div className="dashboard-actions">
        <button 
          className="primary-action"
          onClick={() => navigate('/currencies/create')}
        >
          Create New Currency
        </button>
        
        <div className="quick-actions">
          <button onClick={() => navigate('/players')}>
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Manage Players
          </button>
          <button onClick={() => navigate('/citems')}>
            <svg viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            View Items
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {/* This would be populated with real data */}
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-details">
              <p>Player "Notch" was updated</p>
              <small>2 minutes ago</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">💰</div>
            <div className="activity-details">
              <p>New currency "Dragon Coins" created</p>
              <small>15 minutes ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;