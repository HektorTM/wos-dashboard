import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';

type Interaction = {
  id: string;
}

type CreateInteractionPopupProps = {
  onClose: () => void;
  onCreate: (newInteraction: Interaction) => void;
};

const CreateInteractionPopup = ({ onClose, onCreate }: CreateInteractionPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('interaction', `${id}`, `${authUser?.uuid}`);
        onCreate({
          id
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
          <h3>Create Interaction</h3>
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
                'Create Interaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInteractionPopup;