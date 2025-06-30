import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../utils/usePermission';
import { getStaffUserByUUID, parseTime } from '../utils/parser';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

type ActivityLog = {
  id: number;
  type: string;
  target_id: string;
  username: string;
  action: 'Created' | 'Edited' | 'Deleted' | 'Locked' | 'Unlocked';
  timestamp: string;
};

interface Changelog {
  id: number;
  time: string;
  changelog: string;
  created_by: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [changelog, setChangelog] = useState<Changelog>();
  const [changelogText, setChangelogText] = useState('');
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const {hasPermission} = usePermission();
  const [createdByName, setCreatedByName] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/activity/recent`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          navigate('/login')
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => setActivities(data))
      .catch((err) => console.error('Failed to fetch activity', err));
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/changelogs/recent`, {
      method: 'GET',
      credentials: 'include',
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => setChangelog(data))
    .catch((err) => console.error('Failed to fetch Changelog', err));
  }, []);
  
  useEffect(() => {
    if (changelog?.created_by) {
      const result = getStaffUserByUUID(changelog.created_by);
      if (result instanceof Promise) {
        result.then((user) => setCreatedByName(user.username));
      } else {
        setCreatedByName('Unknown');
      }
    }
  }, [changelog]);

  const handleChangelogSubmit = async () => {
    const payload = {
      changelog: changelogText,
      created_by: authUser?.uuid,
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/changelogs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setChangelog(newEntry);
        setShowChangelogModal(false);
        setChangelogText('');
      }
    } catch (err) {
      console.error('Failed to save changelog:', err);
    }
  };

  function parseChangelog(text: string): string {
  return text
    .replace(/</g, '&lt;') // prevent HTML injection
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>') // handle line breaks
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/_(.+?)_/g, '<u>$1</u>'); // underline
}


  const handleActivityClick = (log: ActivityLog) => {
    // Only navigate for Created/Edited actions
    if (log.action === 'Created' || log.action === 'Edited') {
      navigate(`/view/${log.type}/${log.target_id}`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        {hasPermission('CHANGELOG_CREATE') &&(
          <button style={{position: 'relative', left: '15rem'}}className='create-button' onClick={() => setShowChangelogModal(true)}> + Add Changelog</button>
        )}
      </div>

      <div className="dashboard-content">
        <div className="content-main">
          <div className="placeholder-card">
            <h3>Server Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Players</h4>
                <p>//</p>
              </div>
              <div className="stat-card">
                <h4>Active Sessions</h4>
                <p>//</p>
              </div>
              <div className="stat-card">
                <h4>Total Interactions</h4>
                <p>//</p>
              </div>
              <div className="stat-card">
                <h4>Total Staff</h4>
                <p>//</p>
              </div>
            </div>
          </div>
          {changelog != null && (
          <div className="placeholder-card">
            <h3>Recent Changelog</h3> 
             <p 
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{__html: parseChangelog(changelog?.changelog || '')}}
             />
             <small>Posted by: <strong>{createdByName != undefined && createdByName != null ? createdByName : "Unknown" }</strong></small> <br/>
             <small>{parseTime(`${changelog?.time}`)}</small>
          </div>
          )}
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
                      <strong>{log.username || 'Unknown user'}</strong> {log.action} <br /> {log.type}: {log.target_id}
                    </p>
                    <small>{new Date(log.timestamp).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showChangelogModal && (
        <Modal 
          isOpen={showChangelogModal}
          onClose={() => setShowChangelogModal(false)}
          title={`Add Changelog`}
        >
          <div className="form-group">
            <label>Changelog Text</label>
            <textarea
              placeholder='Enter changelog...'
              value={changelogText}
              onChange={(e) => setChangelogText(e.target.value)}
              className="form-control"
              rows={5}
            />
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowChangelogModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleChangelogSubmit}
              >
                Add
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Dashboard;