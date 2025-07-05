import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import PageMetaBox from '../../components/metaboxes/PageMetaBox.tsx';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';

const ViewFish = () => {
  const { authUser } = useAuth();
  const { id } = useParams(); // Extract the currency ID from the URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fish, setFish] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const fetchFish = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fishies/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setFish(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch fish details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFish();
  }, [id]);
  
  const fetchLockedValue = async () => {
    try {
      
      const result = await fetchLocked('fish', `${id}`);
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
  
    const updatedFish = {
      citem_id: fish.citem_id,
      catch_interaction: fish.catch_interaction,
      rarity: fish.rarity,
      regions: fish.regions,
      uuid: authUser?.uuid,
    };
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fishies/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFish),
      });
  
      if (res.ok) {
        touchPageMeta('fish', `${id}`, `${authUser?.uuid}`);
        alert('Fish updated!');
        
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error updating Fish');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update Fish');
    }
  };
  

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Fish | ${id}`}></TitleComp>
      <div
        className="form-meta-container"
        style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
      >
        <PageMetaBox type="fish" id={id!} />
        <div style={{ flex: 3 }}>
          {error && <div className="error-message">{error}</div>}
          {locked && (
            <div className="alert alert-warning page-input">
              This Fish is locked and cannot be edited.
            </div>
          )}

          {loading ? (
            <Spinner type="Currency" />
          ) : fish ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={fish.id}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Rarity</label>
                <input
                  placeholder='Select'
                  list='rarities'
                  value={fish.rarity}
                  required
                  disabled={locked}
                  onChange={(e) => setFish({...fish, rarity: e.target.value})}
                  className="form-control"
                />
                <datalist id="rarities">
                  <option style={{background:""}} value="common"></option>
                  <option value="uncommon"></option>
                  <option value="rare"></option>
                  <option value="epic"></option>
                  <option value="legendary"></option>
                  <option value="ancient"></option>
                  <option value="mythic"></option>
                </datalist>
              </div>

              <div className="form-group">
                <label>Citem Identifier</label>
                <input
                  type="text"
                  placeholder='Citem ID'
                  value={fish.citem_id}
                  onChange={(e) => setFish({...fish, citem_id: e.target.value})}
                  required
                  disabled={locked}
                />
              </div>

              <div className="form-group">
                <label>Catch Interaction</label>
                <input
                  type="text"
                  value={fish.catch_interaction}
                  placeholder='Interaction ID'
                  onChange={(e) => setFish({...fish, catch_interaction: e.target.value})}
                  disabled={locked}
                />
              </div>

              <div className="form-group">
                <label>Regions</label>
                <input
                  type="text"
                  value={fish.regions}
                  placeholder='Region1,Region2,...'
                  onChange={(e) => setFish({...fish, regions: e.target.value})}
                  disabled={locked}
                />
              </div>

              <button type="submit" className="btn btn-success" disabled={locked}>
                Save Changes
              </button>
            </form>
          ) : (
            <p>Fish not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFish;
