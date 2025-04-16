import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PERMISSION_GROUPS } from '../../utils/permissions';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CreateUser = () => {
  const { theme } = useTheme();
  const [uuid, setUUID] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const handlePermissionChange = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUser = { uuid, password, permissions, editorUUID: authUser?.uuid, };

    try {
      const res = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        alert('User created successfully!');
        navigate('/users');
      } else {
        const error = await res.json();
        alert(`Server: ${error.error || 'Failed to create user'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create user');
    }
  };

  return (
    <div className={`page-container ${theme}`}>
      <div className='page-header'>
        <h3>Create New User</h3>
      </div>
      <form onSubmit={handleSubmit} className='form-section'>
        <div className="mb-3">
          <label className="form-label">Minecraft UUID</label>
          <input
            type="text"
            className="form-control"
            value={uuid}
            onChange={(e) => setUUID(e.target.value)}
            placeholder="Enter UUID"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Permissions</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.group}>
                <h4>{group.group}</h4> {/* Group Title */}
                {group.permissions.map((perm) => (
                  <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm.key)}
                      onChange={() => handlePermissionChange(perm.key)}
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-success">
          Create User
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
