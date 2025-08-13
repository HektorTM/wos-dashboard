import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';
import {useNavigate} from "react-router-dom";

type TimeEvent = {
  id: string;
  name: string;
  message: string;
  isDefault: boolean;
  date: string;
  start_time: number;
  end_time: number;
  start_interaction: string;
  end_interaction: string;
};

type CreateTimeEventPopupProps = {
  onClose: () => void;
  onCreate: (newTimeevent: TimeEvent) => void;
};

const CreateTimePopUp = ({ onClose, onCreate }: CreateTimeEventPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [date, setDate] = useState('');
  const [start_time, setStartTime] = useState(0);
  const [end_time, setEndTime] = useState(0);
  const [start_interaction, setStartInteraction] = useState('');
  const [end_interaction, setEndInteraction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [created, setCreated] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: parseID(id),
      name,
      message: message || null,
      is_default: isDefault ? 1 : 0,
      date: date || null,
      start_time,
      end_time,
      start_interaction: start_interaction || null,
      end_interaction: end_interaction || null,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/timeevents`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('timeevent', `${parseID(id)}`, `${authUser?.uuid}`);
        onCreate({
          id,
          name,
          message,
          isDefault,
          date,
          start_time,
          end_time,
          start_interaction,
          end_interaction,
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
    navigate(`/view/timeevent/${id}`);
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>Create Time Event</h3>
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
                <label>Name</label>
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
              <div className="form-group">
                <label>Message</label>
                <input
                  type="text"
                  value={message}
                  placeholder="Message displayed in chat"
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            {!created && (
              <div className="form-group checkbox-group">
                <label  htmlFor="isDefault">Default</label><input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  disabled={loading}
              />
              </div>
            )}
            {!isDefault && !created && (
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  value={date}
                  placeholder="month-day | example: 01-01"
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            {!created && (
              <div className="form-group">
                  <label>Start Time</label>
                  <input
                  type="number"
                  min="0"
                  max="23"
                  value={start_time}
                  onChange={(e) => setStartTime(parseInt(e.target.value))}
                  required
                  disabled={loading}
                />
              </div>
            )}
            {!created && (
              <div className="form-group">
                  <label>End Time</label>
                  <input
                  type="number"
                  min="0"
                  max="23"
                  value={end_time}
                  onChange={(e) => setEndTime(parseInt(e.target.value))}
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
                  placeholder="Interaction to trigger at start"
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
                  placeholder="Interaction to trigger at end"
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
                  'Create Time Event'
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

export default CreateTimePopUp;