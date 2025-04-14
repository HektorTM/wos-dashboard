import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// same imports...

const ViewUnlockable = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const [unlockable, setUnlockable] = useState<{id: string, temp: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnlockable = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/unlockables/${id}`);
        if (!res.ok) throw new Error('Failed to fetch unlockable');
        const data = await res.json();
        setUnlockable(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load unlockable details');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockable();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unlockable) return;

    try {
      const res = await fetch(`http://localhost:3001/api/unlockables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp: unlockable.temp })
      });

      if (!res.ok) throw new Error('Update failed');
      alert('Unlockable updated!');
      navigate('/unlockables');
    } catch (err) {
      console.error(err);
      setError('Failed to update unlockable');
    }
  };

  return (
    <div className={`citem-container ${theme}`}>
      <h2>Edit Unlockable</h2>
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading unlockable...</p>
        </div>
      ) : unlockable ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              value={unlockable.id}
              disabled
              className="form-control"
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="temp"
              className="form-check-input"
              checked={unlockable.temp === 1}
              onChange={(e) => setUnlockable({
                ...unlockable,
                temp: e.target.checked ? 1 : 0
              })}
            />
            <label htmlFor="temp" className="form-check-label">
              Temporary
            </label>
          </div>

          <button type="submit" className="primary-action">
            Save Changes
          </button>
        </form>
      ) : (
        <p>Unlockable not found</p>
      )}
    </div>
  );
};

export default ViewUnlockable;
