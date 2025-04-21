import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseUsernameToUUID } from '../utils/parser';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const resolvedUUID = await parseUsernameToUUID(username) as string;

    if (!resolvedUUID) {
      throw new Error('Failed to resolve Minecraft username to UUID');
    }

    const res = await fetch('http://localhost:3001/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolvedUUID, password }),
      credentials: 'include',
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    const user = data.user;

    if (user.is_active === 0) {
      return setError('Your account is not activated. Message an Admin.');
    }
  
    localStorage.setItem('authUser', JSON.stringify(user));
    navigate('/dashboard');
    window.location.reload();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    setError(err.message || 'Something went wrong');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="login-page-container">
      <div className="login-center-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please enter your username and password</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Minecraft username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : 'Log In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Forgot password? <a href="/reset-password">Reset here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
