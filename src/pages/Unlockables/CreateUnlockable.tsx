import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const CreateUnlockable = () => {
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [temp, setTemp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/unlockables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, temp: temp ? 1 : 0 })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Creation failed');
      }

      alert('Unlockable created!');
      navigate('/unlockables');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create unlockable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`citem-container ${theme}`}>
      <h2>Create New Unlockable</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            className="form-control"
          />
        </div>

        <div className="form-check">
          <input
            type="checkbox"
            id="temp"
            className="form-check-input"
            checked={temp}
            onChange={(e) => setTemp(e.target.checked)}
          />
          <label htmlFor="temp" className="form-check-label">
            Temporary
          </label>
        </div>

        <button
          type="submit"
          className="primary-action"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Creating...
            </>
          ) : (
            'Create Unlockable'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateUnlockable;
