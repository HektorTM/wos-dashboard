import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PERMISSIONS } from '../utils/permissions'; 

const getPermissionLabels = (keys: string[]) => {
    return PERMISSIONS.filter((p) => keys.includes(p.key)).map((p) => p.label).join(', ');
  };
  

interface User {
  id: number;
  username: string;
  permissions: string[] | string; // Allow for raw string fallback
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/admin/users');
        const data = await res.json();

        // Parse permissions if needed
        const parsedUsers = data.map((user: User) => ({
          ...user,
          permissions: Array.isArray(user.permissions)
            ? user.permissions
            : JSON.parse(user.permissions),
        }));

        setUsers(parsedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`http://localhost:3001/api/users/${id}`, { method: 'DELETE' });
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h3>User Management</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Link to="/admin/users/create" className="btn btn-primary mb-3">
            Create New User
          </Link>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{Array.isArray(user.permissions) ? getPermissionLabels(user.permissions) : 'Invalid permissions'}</td>
                  <td>
                    <Link to={`/admin/users/edit/${user.id}`} className="btn btn-warning btn-sm">
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default UserList;
