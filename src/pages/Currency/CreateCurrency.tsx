import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';

const CreateCurrency = () => {
  const { authUser } = useAuth();
  const [error, setError] = useState('');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [short_name, setShortName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [hidden_if_zero, setHiddenIfZero] = useState(false);
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id,
      name,
      short_name,
      icon,
      color,
      hidden_if_zero,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/currencies', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      

      const result = await res.json();
      if (res.ok) {
        createPageMeta('currency', `${id}`, `${authUser?.username}`)

        alert('Currency created!');
        // Optional: clear form
        setId('');
        setName('');
        setShortName('');
        setIcon('');
        setColor('');
        setHiddenIfZero(false);
        Navigate('/currencies')
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
      <h2>Create a New Currency</h2>
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

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Short Name</label>
          <input
            type="text"
            className="form-control"
            value={short_name}
            onChange={(e) => setShortName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Icon (optional)</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <input
            type="text"
            className="form-control"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="hiddenIfZero"
            checked={hidden_if_zero}
            onChange={(e) => setHiddenIfZero(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="hiddenIfZero">
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
            'Create Currency'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCurrency;
