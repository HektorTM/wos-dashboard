import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';
import { useNavigate } from 'react-router-dom';

type Cosmetic = {
  type: string;
  id: string;
  display: string
  description: string
}

type CreateCosmeticPopupProps = {
  onClose: () => void;
  onCreate: (newCosmetic: Cosmetic) => void;
};

const CreateCosmeticPopup = ({ onClose, onCreate }: CreateCosmeticPopupProps) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [type, setType] = useState('');
  const [id, setId] = useState('');
  const [display, setDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      type,
      id: parseID(id),
      display,
      description,
      uuid: authUser?.uuid,
  };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cosmetics`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('cosmetic', `${parseID(id)}`, `${authUser?.uuid}`);
        onCreate({
          type,
          id,
          display,
          description
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
    navigate(`/view/cosmetic/${id}`);
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>{!created ? `Create Cosmetic` : `Forward to ${id}?`}</h3>
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
            <div className="form-group page-input">
              <label>Type</label>
              <div className="btn-group" role="group" aria-label="Type selection">
                  {["title", "badge", "prefix"].map((typeOption) => (
                      <button
                          key={typeOption}
                          type="button"
                          className={`btn btn-outline-primary ${type === typeOption ? "active" : ""}`}
                          onClick={() => setType(typeOption)}
                      >
                          {typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
                      </button>
                  ))}
              </div>
            </div>
          )}
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
            <label>Display</label>
            <input
              type="text"
              value={display}
              onChange={(e) => setDisplay(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          )}

          {!created && (
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
                'Create Cosmetic'
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

export default CreateCosmeticPopup;