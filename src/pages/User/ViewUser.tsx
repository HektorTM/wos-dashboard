import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PERMISSIONS, PermissionKey } from '../../utils/permissions';

const ViewUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/admin/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();

        // Debug: log what's coming in
        console.log('Fetched user data:', data);

        setUser({ username: data.username });

        let parsedPermissions: PermissionKey[] = [];

        if (Array.isArray(data.permissions)) {
          parsedPermissions = data.permissions;
        } else if (typeof data.permissions === 'string') {
          try {
            parsedPermissions = JSON.parse(data.permissions);
          } catch {
            console.warn('Could not parse permissions string:', data.permissions);
          }
        }

        // Just in case, filter out invalid keys
        const validPermissionKeys = PERMISSIONS.map(p => p.key);
        setPermissions(parsedPermissions.filter(p => validPermissionKeys.includes(p)));
      } catch (err) {
        console.error('Error fetching user:', err);
        alert('Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handlePermissionChange = (perm: PermissionKey) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, permissions }),
      });

      if (res.ok) {
        alert('User updated!');
        navigate('/admin/users');
      } else {
        alert('Error updating user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  };

  if (loading) return <div className="container mt-4"><p>Loading user...</p></div>;

  return (
    <div className="container mt-4">
      <h3>Edit User</h3>
      {user && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
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
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default ViewUser;
