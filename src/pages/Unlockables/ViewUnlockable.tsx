import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/metaboxes/PageMetaBox.tsx';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import { fetchPageItem } from '../../helpers/FetchPageItem';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';

const ViewUnlockable = () => {
  const { authUser } = useAuth();
  const { id } = useParams(); // Extract the currency ID from the URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [unlockable, setUnlockable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const fetchUnlockable = async () => {
      try {
        const data = await fetchPageItem('unlockables', `${id}`);
        setUnlockable(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch unlockable details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockable();
  }, [id]);

  const fetchLockedValue = async () => {
      try {
        
        const result = await fetchLocked('unlockable', `${id}`);
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
  
    const updatedUnlockable = {
      temp: unlockable.temp ? 1 : 0,
      uuid: authUser?.uuid,
    };
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/unlockables/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUnlockable),
      });
  
      if (res.ok) {
        touchPageMeta('unlockable', `${id}`, `${authUser?.uuid}`);
        alert('Unlockable updated!');

      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error updating Unlockable');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update Unlockable');
    }
  };
  

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Unlockable | ${id}`}></TitleComp>
      <div
        className="form-meta-container"
        style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
      >
        <PageMetaBox type="unlockable" id={id!} />
        <div style={{ flex: 3 }}>
          {error && <div className="error-message">{error}</div>}
          {locked && (
            <div className="alert alert-warning page-input">
              This Unlockable is locked and cannot be edited.
            </div>
          )}
          {loading ? (
                <Spinner type="Unlockable" />
          ) : unlockable ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={unlockable.id}
                  disabled
                />
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={unlockable.temp === 1}
                  disabled={locked}
                  onChange={(e) =>
                    setUnlockable({
                      ...unlockable,
                      temp: e.target.checked ? 1 : 0,
                    })
                  }
                />
                <label className="form-check-label">
                  Temporary
                </label>
              </div>

              <button type="submit" className="btn btn-success" disabled={locked}>
                Save Changes
              </button>
            </form>
          ) : (
            <p>Unlockable not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUnlockable;
