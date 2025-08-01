import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchType } from '../../helpers/FetchPageItem';
import CreateCosmeticPopup from './CreateCosmeticPopUp';
import { parseMinecraftColorCodes } from '../../utils/parser';
import TitleComp from '../../components/TitleComponent';
import ForwardPopup from '../../components/ForwardModal';
import {useNavigate} from "react-router-dom";
import {usePermission} from "../../utils/usePermission.ts";

type Cosmetic = {
  type: string;
  id: string;
  display: string;
  description: string;
};

const CurrencyTab = () => {
  const { theme } = useTheme();
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {hasPermission} = usePermission();
  
  const [showForwardPopup, setShowForwardPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [recentCreated, setRecentCreated] = useState('');

  useEffect(() => {
    const fetchCosmetics = async () => {
      try {
        const data = await fetchType('cosmetics');
        setCosmetics(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load cosmetics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCosmetics();
  }, []);

  const handleCosmeticCreated = (newCosmetic: Cosmetic) => {
    setRecentCreated(newCosmetic.id);
    setCosmetics([...cosmetics, newCosmetic]);
  }

    const handleClick = (id:string) => {
        if (hasPermission('COSMETIC_EDIT')) {
          navigate(`/view/cosmetic/${id}`);
        } else {
          return;
        }
    };

  const filteredCosmetics = cosmetics.filter((c) =>
    [c.type, c.id, c.display, c.description].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Cosmetics | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Cosmetics</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID, name, short name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        { hasPermission('COSMETIC_CREATE') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Cosmetic
        </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading cosmetics...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>Type</th>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Display</th>
                <th style={{padding: '4px 8px'}}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredCosmetics.map((cosmetic) => (
                <tr key={cosmetic.id} style={{height: '32px'}} onClick={() => handleClick(cosmetic.id)}>
                  <td style={{padding: '4px 8px'}}>{cosmetic.type}</td>
                  <td style={{padding: '4px 8px'}}>{cosmetic.id}</td>
                  <td style={{padding: '4px 8px'}}>{parseMinecraftColorCodes(cosmetic.display)}</td>
                  <td style={{padding: '4px 8px'}}>{parseMinecraftColorCodes(cosmetic.description)}</td>
                </tr>
              ))}
              {filteredCosmetics.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching cosmetics found' : 'No cosmetics available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateCosmeticPopup 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleCosmeticCreated}
        />
      )}

      {showForwardPopup && (
        <ForwardPopup onClose={() => setShowForwardPopup(false)} type={'cosmetic'} id={recentCreated}></ForwardPopup>
      )}

    </div>
  );
};

export default CurrencyTab;