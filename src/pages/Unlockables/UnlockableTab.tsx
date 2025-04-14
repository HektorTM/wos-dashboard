import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

type Unlockable = {
  id: string;
  temp: number;
};

const UnlockableTab = () => {
  const { theme } = useTheme();
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnlockables = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/unlockables');
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
      });

      if (!res.ok) throw new Error('Failed to delete');
      setUnlockables(unlockables.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete unlockable. Please try again.');
    }
  };

  const filteredUnlockables = unlockables.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`citem-container ${theme}`}>
      <div className="citem-header">
        <h2>Unlockables</h2>
        <div className="citem-search">
          <input
            type="text"
            placeholder="Search unlockables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <Link to="/create/unlockable" className="primary-action">
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
        <div className="citem-table-container">
          <table className="citem-table">
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
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/view/unlockable/${unlockable.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUnlockable(unlockable.id)}
                    >
                      🗑️
                    </button>
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
