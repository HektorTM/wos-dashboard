import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/metaboxes/PageMetaBox.tsx';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import { fetchPageItem } from '../../helpers/FetchPageItem';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';

const ViewTime = () => {
  const { authUser } = useAuth();
  const { id } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeevent, setTimeevent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const fetchTimeEventAndMeta = async () => {
      try {
        const data = await fetchPageItem('timeevents', `${id}`);
        setTimeevent(data);

      } catch (err) {
        console.error(err);
        setError('Failed to fetch Time Event');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTimeEventAndMeta();
    }
  }, [id]);

  const fetchLockedValue = async () => {
    try {
      
      const result = await fetchLocked('timeevent', `${id}`);
      if (result == 1) {
        setLocked(true);
      } else {
        setLocked(false);
      }

    } catch (err) {
      console.error(err);
    }
  }
  fetchLockedValue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTimeEvent = {
      name: timeevent.name,
      message: timeevent.message || null,
      isDefault: timeevent.isDefault ? 1 : 0,
      date: timeevent.date || null,
      start_time: timeevent.start_time,
      end_time: timeevent.end_time,
      start_interaction: timeevent.start_interaction,
      end_interaction: timeevent.end_interaction,
      uuid: authUser?.uuid,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/timeevents/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTimeEvent),
      });

      if (res.ok) {
        touchPageMeta('timeevent', `${id}`, `${authUser?.uuid}`);
        alert('Time Event updated!');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error updating Time Event');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update Time Event');
    }
  };

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Time Event | ${id}`}></TitleComp>
      <div
        className="form-meta-container"
        style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
      >
        <PageMetaBox type="timeevent" id={id!} deletePerm='TIME_DELETE' />
        <div style={{ flex: 3 }}>
          {error && <div className="error-message">{error}</div>}
          {locked && (
            <div className="alert alert-warning page-input">
              This Time Event is locked and cannot be edited.
            </div>
          )}

          {loading ? (
            <Spinner type="Time Event" />
          ) : timeevent ? (
            <form onSubmit={handleSubmit}>
              {/* Wrapping all controls in a fieldset disabled when locked */}
              <fieldset disabled={locked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="form-group page-input">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={timeevent.name}
                    onChange={(e) =>
                      setTimeevent({ ...timeevent, name: e.target.value })
                    }
                    disabled={locked}
                  />
                </div>

                <div className="form-group page-input">
                  <label>Message</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Message displayed in chat"
                    value={timeevent.message}
                    onChange={(e) =>
                      setTimeevent({ ...timeevent, message: e.target.value })
                    }
                  />
                </div>

                <div className="form-check page-input">
                  <label className="form-check-label">Default</label>
                  <input
                      className="form-check-input"
                      type="checkbox"
                      checked={timeevent.isDefault === 1 ? true : false}
                      onChange={(e) =>
                          setTimeevent({
                            ...timeevent,
                            isDefault: e.target.checked ? 1 : 0,
                          })
                      }
                  />

                </div>
                { !timeevent.isDefault && (
                    <div className="form-group page-input">
                      <label>Date</label>
                      <input
                          type="text"
                          placeholder="month-day | example: 01-01"
                          className="form-control"
                          value={timeevent.date}
                          onChange={(e) =>
                              setTimeevent({...timeevent, date: e.target.value})
                          }
                      />
                    </div>
                )}


                <div className="form-group page-input">
                  <label>Start Time</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    className="form-control"
                    value={timeevent.start_time}
                    onChange={(e) =>
                      setTimeevent({ ...timeevent, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="form-group page-input">
                  <label>End Time</label>
                  <input
                      type="number"
                      min="0"
                      max="23"
                      className="form-control"
                      value={timeevent.end_time}
                      onChange={(e) =>
                          setTimeevent({ ...timeevent, end_time: e.target.value })
                      }
                  />
                </div>
                <div className="form-group page-input">
                  <label>Start Interaction</label>
                  <input
                      type="text"
                      className="form-control"
                      value={timeevent.start_interaction}
                      onChange={(e) =>
                          setTimeevent({ ...timeevent, start_interaction: e.target.value })
                      }
                  />
                </div>
                <div className="form-group page-input">
                  <label>End Interaction</label>
                  <input
                      type="text"
                      className="form-control"
                      value={timeevent.end_interaction}
                      onChange={(e) =>
                          setTimeevent({ ...timeevent, end_interaction: e.target.value })
                      }
                  />
                </div>



                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
              </fieldset>
            </form>
          ) : (
            <p>Time Event not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTime;
