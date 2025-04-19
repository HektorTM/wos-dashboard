import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ActivityLog = {
  id: number;
  type: string;
  target_id: string;
  username: string;
  action: 'Created' | 'Edited' | 'Deleted' | 'Locked' | 'Unlocked';
  timestamp: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/activity/recent', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            //navigate('/login'); // Redirect to login if unauthorized
          }
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => setActivities(data))
      .catch((err) => console.error('Failed to fetch activity', err));
  }, []);
  
  

  const handleActivityClick = (log: ActivityLog) => {
    // Only navigate for Created/Edited actions
    if (log.action === 'Created' || log.action === 'Edited') {
      navigate(`/view/${log.type}/${log.target_id}`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your system.</p>
      </div>

      <div className="dashboard-content">
        <div className="content-main">
          <div className="placeholder-card">
            <h3>System Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p>1,248</p>
              </div>
              <div className="stat-card">
                <h4>Active Sessions</h4>
                <p>84</p>
              </div>
              <div className="stat-card">
                <h4>New Today</h4>
                <p>32</p>
              </div>
              <div className="stat-card">
                <h4>Transactions</h4>
                <p>1,482</p>
              </div>
            </div>
          </div>
        </div>

        <div className="content-sidebar">
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {activities.map((log) => (
                <div 
                  key={log.id} 
                  className={`activity-item ${(log.action === 'Created' || log.action === 'Edited') ? 'clickable' : ''}`}
                  onClick={() => handleActivityClick(log)}
                >
                  <div className="activity-icon">
                    {log.action === 'Created' && '➕'}
                    {log.action === 'Edited' && '✏️'}
                    {log.action === 'Deleted' && '🗑️'}
                    {log.action === 'Locked' && '🔒'}
                    {log.action === 'Unlocked' && '🔓'}
                  </div>
                  <div className="activity-details">
                    <p>
                      <strong>{log.username || 'Unknown user'}</strong> {log.action} {log.type}: {log.target_id}
                    </p>
                    <small>{new Date(log.timestamp).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;