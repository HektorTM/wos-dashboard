import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';
import { useNavigate } from 'react-router-dom';

type Cooldown = {
  id: string;
  duration: number;
  start_interaction: string;
  end_interaction: string;
};

type CreateCooldownPopupProps = {
  onClose: () => void;
  onCreate: (newCooldown: Cooldown) => void;
};

const CreateCooldownPopup = ({ onClose, onCreate }: CreateCooldownPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [duration, setDuration] = useState(0)
  const [start_interaction, setStartInteraction] = useState('');
  const [end_interaction, setEndInteraction] = useState('')
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [created, setCreated] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: parseID(id),
      duration,
      start_interaction,
      end_interaction,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cooldowns`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('cooldown', `${parseID(id)}`, `${authUser?.uuid}`);
        onCreate({
          id,
          duration,
          start_interaction,
          end_interaction,
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
    navigate(`/view/cooldown/${id}`);
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>{!created ? `Create Cooldown` : `Forward to ${id}?`}</h3>
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
              <label>Duration</label>
              <input
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                required
                disabled={loading}
              />
            </div>
          )}
          {!created && (
            <div className="form-group">
              <label>Start Interaction</label>
              <input
                type="text"
                value={start_interaction}
                onChange={(e) => setStartInteraction(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {!created && (
            <div className="form-group">
              <label>End Interaction</label>
              <input
                type="text"
                value={end_interaction}
                onChange={(e) => setEndInteraction(e.target.value)}
                
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
                'Create Cooldown'
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

export default CreateCooldownPopup;