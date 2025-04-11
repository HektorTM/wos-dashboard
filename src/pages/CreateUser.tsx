import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PERMISSIONS } from '../utils/permissions';

const CreateUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const navigate = useNavigate();

  const handlePermissionChange = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = { username, password, permissions };

    try {
      const res = await fetch('http://localhost:3001/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        alert('User created successfully!');
        navigate('/admin/users');
      } else {
        alert('Page: Error creating user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create user');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Create New User</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            required
          />
        </div>

        <div className="mb-3">
            <label className="form-label">Permissions</label>
            <div>
                {PERMISSIONS.map((perm) => (
                <label key={perm.key} className="d-block">
                    <input
                    type="checkbox"
                    checked={permissions.includes(perm.key)}
                    onChange={() => handlePermissionChange(perm.key)}
                    />{' '}
                    {perm.label}
                </label>
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
