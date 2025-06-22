import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import TitleComp from '../../components/TitleComponent';

const AccountPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState<{
    uuid: string;
    username: string;
    permissions: string[];
  } | null>(null);
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Fetch user data
useEffect(() => {
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch user info');
      }
      
      const {user} = await res.json();
      console.log('API Response:', user); // Debug log
      
      setUserInfo({
        uuid: user.uuid,
        username: user.username,
        permissions: user.permissions || []
      });
    } catch (e) {
      console.error('Error fetching user info:', e);
      setError(`Failed to load account information: ${e}`);
      // Optionally logout if the session is invalid

    } finally {
      setLoading(false);
    }
  };

  fetchUserInfo();
}, [logout, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      if (res.ok) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Optionally log the user out after password change
        logout();
        navigate('/login');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('An error occurred while changing password');
    }
  };

  if (loading) return <div className="page-container"><p>Loading account information...</p></div>;

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`My Account | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>My Account</h2>
      </div>

      {userInfo && (
        <div className="account-content">
          <div className="account-card-with-head">
            <div className="account-info-section">

              <dl className="account-info">
                <dt>Username</dt>
                <dd>{`${userInfo.username}`}</dd>

                <dt>Unique User ID</dt>
                <dd>
                  <code>{`${userInfo.uuid}`}</code>
                </dd>
              </dl>
            </div>
            <div className='player-head-section'>
                <img 
              src={`https://mc-heads.net/avatar/${userInfo.uuid}/100`} 
              alt="Player Head" 
              className="player-head-image"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/100';
              }}
            />
            </div>
          </div>

          <div className="account-card">
            <div className="card-body">
              <h5 className="card-title">Change Password</h5>
              
              {error && <div className="account-alert account-alert-danger">{error}</div>}
              {success && <div className="account-alert account-alert-success">{success}</div>}
              
              <form onSubmit={handlePasswordChange} className='account-form'>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <button type="submit" className="account-btn-primary">
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;