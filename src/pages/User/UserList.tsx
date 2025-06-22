import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import TitleComp from '../../components/TitleComponent';



interface User {
  uuid: string;
  username: string;
  permissions?: string[] | string;
  is_active: number;
}

const UserList = () => {
  const { theme } = useTheme();
  const { authUser } = useAuth();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const PROTECTED_UUID = '28c63f6552cc47f08246b16f2176da23';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {method: 'GET', credentials: 'include'});
        const data = await res.json();

        const parsedUsers = data.map((user: User) => ({
          ...user,
          permissions: Array.isArray(user.permissions)
            ? user.permissions
            : user.permissions
            ? JSON.parse(user.permissions)
            : [],
        }));

        setUsers(parsedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load Users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/${uuid}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uuid: authUser?.uuid
          })
        });
        setUsers(users.filter(user => user.uuid !== uuid));
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const filteredUsers = users.filter((c) =>
    [c.username, c.is_active].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`User Management | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>User Management</h2>
        <div className='page-search'>
          <input 
            type="text"
            placeholder="Search by Username, active..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <Link to="/create/user" className="primary-action">
          + Create User
        </Link>
      </div>

      {error && <div className='error-message'>{error}</div>}

      {loading ? (
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading Users...</p>
        </div>
      ) : (
        <div className='page-table-container'>
          <table className="page-table">
            <thead>
              <tr>
                <th>UUID</th>
                <th>Username</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.uuid}>
                  <td>{user.uuid}</td>
                  <td>{user.username}</td>
                  <td>{user.is_active ? (
                    <span className="badge active">Active</span>
                    ) : (
                    <span className="badge inactive">Inactive</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => navigate(`/view/user/${user.uuid}`)}
                      disabled={(user.uuid === authUser?.uuid && user.uuid !== PROTECTED_UUID) ||
                                (user.uuid === PROTECTED_UUID && user.uuid !== authUser?.uuid)}
                      title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleDelete(user.uuid)}
                      title="Delete"
                      disabled={user.uuid === PROTECTED_UUID || user.uuid === authUser?.uuid}
                    > 
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className='no-results'>
                    {search ? 'No matching Users found' : 'No Users Available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
