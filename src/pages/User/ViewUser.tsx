import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PERMISSIONS, PermissionKey, PERMISSION_GROUPS } from '../../utils/permissions'; 
import { useAuth } from '../../context/AuthContext';
import TitleComp from '../../components/TitleComponent';

const ViewUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState<{ username: string, is_active: boolean } | null>(null);
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const PROTECTED_UUID = '28c63f6552cc47f08246b16f2176da23';

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if ((id === PROTECTED_UUID && authUser?.uuid !== PROTECTED_UUID) || authUser?.uuid === id) {
        navigate("/users");
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();

        setUser({ username: data.username, is_active: data.is_active });

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

  // Handle permission change
  const handlePermissionChange = (perm: PermissionKey) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      username: user.username,
      permissions,
      editorUUID: authUser?.uuid,
    };

    if (newPassword.trim()) {
      payload.password = newPassword.trim();
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('User updated!');
        navigate('/users');
      } else {
        alert('Error updating user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  };

  // Handle user reactivation
  const handleReactivate = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/reactivate`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        alert('User reactivated!');
        setUser((prevUser) => ({ ...prevUser!, is_active: true }));
      } else {
        alert('Failed to reactivate user');
      }
    } catch (err) {
      console.error(err);
      alert('Error reactivating user');
    }
  };

  if (loading) return <div className="page-container"><p>Loading user...</p></div>;

  return (
    <div className="page-container">
      <TitleComp title={`User | ${id}`}></TitleComp>
      <div className="page-header">
        <h2>Edit User</h2>
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="form-section">
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
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Leave blank to keep existing password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.group}>
                  <h4>{group.group}</h4> {/* Group Title */}
                  {group.permissions.map((perm) => (
                    <label
                      key={perm.key}
                      className={`permission-label ${permissions.includes(perm.key) ? 'checked' : 'unchecked'}`}
                    >
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

          {/* Display Reactivate button if user is inactive */}
          {!user.is_active && (
            <div className="alert alert-warning mb-3">
              This account is currently <strong>deactivated</strong>.
              <button
                type="button"
                className="btn btn-sm btn-outline-primary ms-3"
                onClick={handleReactivate}
              >
                Reactivate User
              </button>
            </div>
          )}

          <button type="submit" className="primary-action">
            💾 Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default ViewUser;
