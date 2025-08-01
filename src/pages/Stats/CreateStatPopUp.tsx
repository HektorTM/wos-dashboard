import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';
import {useNavigate} from "react-router-dom";

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
  const navigate = useNavigate();
  const [created, setCreated] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: parseID(id),
      max,
      capped,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('stat', `${parseID(id)}`, `${authUser?.uuid}`);
        onCreate({
          id,
          max,
          capped: capped ? 1 : 0
        })
        setCreated(id);
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

  const goTo = (id: string) => {
    navigate(`/view/stat/${id}`);
  }

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
          {!created && (
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(parseID(e.target.value))}
              required
              disabled={loading}
            />
          </div>
          )}
          {!created && (
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
          )}
          {!created && (
          <div className="form-group checkbox-group">
            <label htmlFor="capped">Capped</label><input
              type="checkbox"
              id="capped"
              checked={capped}
              onChange={(e) => setCapped(e.target.checked)}
              disabled={loading}
            />
          </div>
          )}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            {!created ? (
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
            ) : (
              <button onClick={() => goTo(id)} className='btn btn-outline-success'>
                Go To {id}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStatPopup;