import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CreateUnlockable = () => {
  const { authUser } = useAuth();
  const [error, setError] = useState('');
  const [id, setId] = useState('');
  const [temp, setTemp] = useState(false);
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id,
      name,
      temp,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/unlockables', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Unlockable created!');
        // Optional: clear form
        setId('');
        setTemp(false);
        Navigate('/unlockables')
      } else {
        setError(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page-container ${theme}`}>
      <h2>Create a New Unlockable</h2>
      {error && <div className='error-message'>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID</label>
          <input
            type="text"
            className="form-control"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="temp"
            checked={temp}
            onChange={(e) => setTemp(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="temp">
            Hidden if zero
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className='spinner'></span> Creating...
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
