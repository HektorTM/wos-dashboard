import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ViewUnlockable = () => {
  const { authUser } = useAuth();
  const { id } = useParams(); // Extract the currency ID from the URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [unlockable, setUnlockable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnlockable = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/unlockables/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setUnlockable(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch currency details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockable();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const updatedUnlockable = {
      temp: unlockable.temp ? 1 : 0,
      uuid: authUser?.uuid,
    };
  
    try {
      const res = await fetch(`http://localhost:3001/api/unlockables/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUnlockable),
      });
  
      if (res.ok) {
        alert('Unlockable updated!');
        navigate('/unlockables'); // Redirect after update
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error updating Unlockable');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update Unlockable');
    }
  };
  

  return (
    <div className={`page-container ${theme}`}>
      <h2>Edit Unlockable</h2>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading Unlockable...</p>
        </div>
      ) : unlockable ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              className="form-control"
              value={unlockable.id}
              disabled
            />
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={unlockable.temp === 1}
              onChange={(e) =>
                setUnlockable({
                  ...unlockable,
                  temp: e.target.checked ? 1 : 0,
                })
              }
            />
            <label className="form-check-label">
              Temporary
            </label>
          </div>

          <button type="submit" className="btn btn-success">
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
