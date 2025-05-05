import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';

type Currency = {
  id: string;
  name: string;
  short_name: string;
  icon: string;
  color: string;
  hidden_if_zero: number;
};

type CreateCurrencyPopupProps = {
  onClose: () => void;
  onCreate: (newCurrency: Currency) => void;
};

const CreateCurrencyPopup = ({ onClose, onCreate }: CreateCurrencyPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [short_name, setShortName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [hidden_if_zero, setHiddenIfZero] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        createPageMeta('currency', `${id}`, `${authUser?.uuid}`);
        onCreate({
          id,
          name,
          short_name,
          icon,
          color,
          hidden_if_zero: hidden_if_zero ? 1 : 0
        });
        onClose();
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
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>Create Currency</h3>
          <button 
            onClick={onClose}
            className="modal-close"
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Short Name</label>
            <input
              type="text"
              value={short_name}
              onChange={(e) => setShortName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Icon (optional)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="hidden_if_zero">Hidden if Zero</label><input
              type="checkbox"
              id="hidden_if_zero"
              checked={hidden_if_zero}
              onChange={(e) => setHiddenIfZero(e.target.checked)}
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCurrencyPopup;