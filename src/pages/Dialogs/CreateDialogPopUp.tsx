import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';
import {useNavigate} from "react-router-dom";
import { Dialog } from '../../types/Dialog.tsx'


type CreateGuiPopupProps = {
  onClose: () => void;
  onCreate: (newDialog: Dialog) => void;
};

const CreateDialogPopup = ({ onClose, onCreate }: CreateGuiPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [dialogId, setDialogId] = useState('');
  const [character, setCharacter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [created, setCreated] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      dialog_id: parseID(dialogId),
      char_name: character,
      uuid: authUser?.uuid
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dialogs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('dialog', `${parseID(dialogId)}`, `${authUser?.uuid}`);
        onCreate({
          dialog_id: dialogId,
          char_name: character
        });
        setCreated(dialogId);
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
    navigate(`/view/dialog/${id}`);
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>Create Dialog</h3>
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
            <label>Identifier</label>
            <input
              type="text"
              value={dialogId}
              onChange={(e) => setDialogId(parseID(e.target.value))}
              required
              disabled={loading}
            />
          </div>
          )}
          {!created && (
          <div className="form-group">
            <label>Character Name</label>
            <input
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
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
                'Create Dialog'
              )}
            </button>
            ) : (
                <button onClick={() => goTo(dialogId)} className='btn btn-outline-success'>
                  Go To {dialogId}
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDialogPopup;