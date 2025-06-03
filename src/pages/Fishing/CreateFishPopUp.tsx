import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';

type Fish = {
  id: string;
  citem_id: string;
  catch_interaction: string;
  rarity: string;
  regions: string;
}

type CreateFishPopupProps = {
  onClose: () => void;
  onCreate: (newFish: Fish) => void;
};

const CreateFishPopup = ({ onClose, onCreate }: CreateFishPopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const [id, setId] = useState('');
  const [citem_id, setCitemId] = useState('');
  const [catch_interaction, setCatchInteraction] = useState('');
  const [rarity, setRarity] = useState('');
  const [regions, setRegions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: parseID(id),
      citem_id,
      catch_interaction,
      rarity,
      regions,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fishies`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        createPageMeta('fish', `${parseID(id)}`, `${authUser?.uuid}`);
        onCreate({
          id,
          citem_id,
          catch_interaction,
          rarity,
          regions
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
          <h3>Create Fish</h3>
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

          <div className="form-group">
            <label>Rarity</label>
            <input
              placeholder='Select'
              list='rarities'
              value={rarity}
              required
              onChange={(e) => setRarity(e.target.value)}
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
              value={citem_id}
              onChange={(e) => setCitemId(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Catch Interaction</label>
            <input
              type="text"
              value={catch_interaction}
              placeholder='Interaction ID'
              onChange={(e) => setCatchInteraction(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Regions</label>
            <input
              type="text"
              value={regions}
              placeholder='Region1,Region2,...'
              onChange={(e) => setRegions(e.target.value)}
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
                'Create Unlockable'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFishPopup;