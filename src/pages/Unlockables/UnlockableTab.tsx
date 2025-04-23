import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import EditButton from '../../components/EditButton';
import DeleteButton from '../../components/DeleteButton';

type Unlockable = {
  id: string;
  temp: number;
};

const UnlockableTab = () => {
  const { theme } = useTheme();
  const { authUser } = useAuth();
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUnlockables = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/unlockables', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load unlockables');
        const data = await res.json();
        setUnlockables(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load unlockables. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockables();
  }, []);

  const deleteUnlockable = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Unlockable?')) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/unlockables/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uuid: authUser?.uuid,
        })
      });

      if (!res.ok) throw new Error('Failed to delete');
      setUnlockables(unlockables.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete unlockable. Please try again.');
    }
  };

  const filteredUnlockables = unlockables.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`page-container ${theme}`}>
      <div className="page-header">
        <h2>Unlockables</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search unlockables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <Link to="/create/unlockable" className="create-button">
          + Create Unlockable
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading unlockables...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnlockables.map((unlockable) => (
                <tr key={unlockable.id}>
                  <td>{unlockable.id}</td>
                  <td>{unlockable.temp ? 'Temporary' : 'Permanent'}</td>
                  <td>
                    <EditButton perm='UNLOCKABLE_EDIT' nav={`/view/unlockable/${unlockable.id}`}></EditButton>
                    <DeleteButton perm='UNLOCKABLE_DELETE' onClick={() => deleteUnlockable(unlockable.id)}></DeleteButton>
                  </td>
                </tr>
              ))}
              {filteredUnlockables.length === 0 && (
                <tr>
                  <td colSpan={3} className="no-results">
                    {search ? 'No matching unlockables found' : 'No unlockables available'}
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

export default UnlockableTab;
