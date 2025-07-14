import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import CreateUnlockablePopUp from './CreateFishPopUp';
import TitleComp from '../../components/TitleComponent';
import {usePermission} from "../../utils/usePermission.ts";
import {useNavigate} from "react-router-dom";

type Fish = {
  id: string;
  citem_id: string;
  catch_interaction: string;
  rarity: string;
  regions: string;
}

const FishingTab = () => {
  const { theme } = useTheme();
  const [fishies, setFishies] = useState<Fish[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasPermission } = usePermission();
    const navigate = useNavigate();

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

  const handleClick = (id:string) => {
    if (hasPermission('FISHING_EDIT')) {
      navigate(`/view/fish/${id}`);
    } else {
      return;
    }
  };

  const handleFishCreated = (newFish: Fish) => {
    setFishies([...fishies, newFish]);
  }

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
        {hasPermission('FISHING_CREATE') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Fish
        </button>
        )}
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
              </tr>
            </thead>
            <tbody>
              {filteredFishies.map((fish) => (
                <tr key={fish.id} style={{height: '32px'}} onClick={() => handleClick(fish.id)}>
                  <td style={{padding: '4px 8px'}}>{fish.id}</td>
                  <td style={{padding: '4px 8px'}}>{fish.rarity}</td>
                  <td style={{padding: '4px 8px'}}>{fish.citem_id}</td>
                  <td style={{padding: '4px 8px'}}>{fish.catch_interaction}</td>
                  <td style={{padding: '4px 8px'}}>{fish.regions}</td>
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
