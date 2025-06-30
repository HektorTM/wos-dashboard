import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';

type Gui = {
  id: string;
  size: number;
  title: string;
}

type CreateGuiPopupProps = {
  onClose: () => void;
  onCreate: (newGui: Gui) => void;
};

const CreateGuiPopup = ({ onClose, onCreate }: CreateGuiPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [size, setSize] = useState(1);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: parseID(id),
      title: title,
      size: size,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/guis`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('gui', `${parseID(id)}`, `${authUser?.uuid}`);
        onCreate({
          id,
          title,
          size
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
          <h3>Create GUI</h3>
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
              onChange={(e) => setId(parseID(e.target.value))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(parseID(e.target.value))}
              required
              disabled={loading}
            />
          </div>

          <div className='form-group'>
            <label>Size</label>
            <input
              type="number"
              min={1}
              max={6}
              value={size}
              onChange={(e) => setSize(e.target.valueAsNumber)}
              required
              disabled={loading}
            ></input>

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
                'Create GUI'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGuiPopup;