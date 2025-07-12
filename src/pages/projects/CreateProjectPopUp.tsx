import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { useNavigate } from 'react-router-dom';
import { generateUUID } from '../../utils/uuid';

type Project = {
  id: string;
  name: string;
  uuid: string;
  public: boolean;
}

type CreateProjectPopupProps = {
  onClose: () => void;
  onCreate: (newProject: Project) => void;
};

const CreateCosmeticPopup = ({ onClose, onCreate }: CreateProjectPopupProps) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id] = useState(generateUUID(10));
  const [name, setName] = useState('');
  const [publicState, setPublicState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: id,
      name: name,
      uuid: authUser?.uuid,
      publicState: publicState ? 1 : 0,
  };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('project', `${id}`, `${authUser?.uuid}`);
        onCreate({
          id: id,
          name: name,
          uuid: `${authUser?.uuid}`,
          public: publicState,
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
    navigate(`/view/project/${id}`);
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>{!created ? `Create Project` : `Forward to ${id}?`}</h3>
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
              <label>Identifier</label>
              <div className="btn-group" role="group" aria-label="Type selection">
                  <input type="text" value={id} disabled></input>
              </div>
            </div>
          )}
          {!created && (
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          )}
          {!created && (
          <div className="form-group checkbox-group">
            <label>Public</label>
            <input
              type="checkbox"
              checked={publicState}
              onChange={(e) => setPublicState(e.target.checked)}
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
                'Create Project'
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