import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';
import {useNavigate} from "react-router-dom";

type Unlockable = {
  id: string;
  temp: number;
}

type CreateUnlockablePopupProps = {
  onClose: () => void;
  onCreate: (newUnlockable: Unlockable) => void;
};

const CreateUnlockablePopup = ({ onClose, onCreate }: CreateUnlockablePopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [temp, setTemp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [created, setCreated] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: parseID(id),
      temp,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/unlockables`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('unlockable', `${parseID(id)}`, `${authUser?.uuid}`);
        onCreate({
          id,
          temp: temp ? 1 : 0
        });
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
    navigate(`/view/unlockable/${id}`);
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>Create Unlockable</h3>
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
          <div className="form-group checkbox-group">
            <label htmlFor="temp">Temporary</label><input
              type="checkbox"
              id="temp"
              checked={temp}
              onChange={(e) => setTemp(e.target.checked)}
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
                'Create Unlockable'
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

export default CreateUnlockablePopup;