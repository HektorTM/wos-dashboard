import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import EditButton from '../../components/buttons/EditButton.tsx';
import DeleteButton from '../../components/buttons/DeleteButton.tsx';
import { deletePageItem } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateUnlockablePopUp from './CreateFishPopUp';
import TitleComp from '../../components/TitleComponent';

type Fish = {
  id: string;
  citem_id: string;
  catch_interaction: string;
  rarity: string;
  regions: string;
}

const FishingTab = () => {
  const { theme } = useTheme();
  const { authUser } = useAuth();
  const [fishies, setFishies] = useState<Fish[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchFishies = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fishies`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load fishies');
        const data = await res.json();
        setFishies(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load fishies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFishies();
  }, []);

  const handleFishCreated = (newFish: Fish) => {
    setFishies([...fishies, newFish]);
  }

  const deleteFish = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Fish?')) return;
    
    try {
      deletePageItem('fishies', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('fish', `${id}`, `${authUser?.uuid}`);
      setFishies(fishies.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete fish. Please try again.');
    }
  };

  const filteredFishies = fishies.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Fishing | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Fishing</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search unlockables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Fish
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading fishes...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Rarity</th>
                <th style={{padding: '4px 8px'}}>Citem ID</th>
                <th style={{padding: '4px 8px'}}>Catch Interaction</th>
                <th style={{padding: '4px 8px'}}>Regions</th>
                <th style={{padding: '4px 8px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFishies.map((fish) => (
                <tr key={fish.id} style={{height: '32px'}}>
                  <td style={{padding: '4px 8px'}}>{fish.id}</td>
                  <td style={{padding: '4px 8px'}}>{fish.rarity}</td>
                  <td style={{padding: '4px 8px'}}>{fish.citem_id}</td>
                  <td style={{padding: '4px 8px'}}>{fish.catch_interaction}</td>
                  <td style={{padding: '4px 8px'}}>{fish.regions}</td>
                  <td style={{padding: '4px 8px'}}>
                    <EditButton perm='FISHING_EDIT' nav={`/view/fish/${fish.id}`}></EditButton>
                    <DeleteButton perm='FISHING_DELETE' onClick={() => deleteFish(fish.id)}></DeleteButton>
                  </td>
                </tr>
              ))}
              {filteredFishies.length === 0 && (
                <tr>
                  <td colSpan={3} className="no-results">
                    {search ? 'No matching fish found' : 'No fish available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateUnlockablePopUp 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleFishCreated}
        />
      )}

    </div>
  );
};

export default FishingTab;
