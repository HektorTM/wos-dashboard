import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';

type Stat = {
  id: string;
  max: string;
  capped: number;
};

type CreateStatPopupProps = {
  onClose: () => void;
  onCreate: (newStat: Stat) => void;
};

const CreateStatPopup = ({ onClose, onCreate }: CreateStatPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [max, setMax] = useState('');
  const [capped, setCapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id,
      max,
      capped,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/stats', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('stat', `${id}`, `${authUser?.uuid}`);
        onCreate({
          id,
          max,
          capped: capped ? 1 : 0
        })
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
          <h3>Create New Stat</h3>
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
            <label>Maximum Value</label>
            <input
              type="text"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="capped">Capped</label><input
              type="checkbox"
              id="capped"
              checked={capped}
              onChange={(e) => setCapped(e.target.checked)}
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
                'Create Stat'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStatPopup;