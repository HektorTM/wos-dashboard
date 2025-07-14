import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchType } from '../../helpers/FetchPageItem';

import TitleComp from '../../components/TitleComponent';
import CreateCooldownPopup from "./CreateCooldownPopUp";
import {usePermission} from "../../utils/usePermission.ts";
import {useNavigate} from "react-router-dom";

type Cooldown = {
  id: string;
  duration: number;
  start_interaction: string;
  end_interaction: string;
};

const CooldownTab = () => {
  const { theme } = useTheme();
  const [cooldowns, setCooldowns] = useState<Cooldown[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  
  // State for the popup
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchCooldowns = async () => {
      try {
        const data = await fetchType('cooldowns');
        setCooldowns(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load cooldowns. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCooldowns();
  }, []);

  const handleClick = (id:string) => {
    if (hasPermission('COOLDOWN_EDIT')) {
      navigate(`/view/cooldown/${id}`);
    } else {
      return;
    }
  };

  const handleCooldownCreated = (newCooldown: Cooldown) => {
    setCooldowns([...cooldowns, newCooldown]);
  }

  const filteredCooldowns = cooldowns.filter((c) =>
    [c.id].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Cooldowns | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Cooldowns</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        { hasPermission('COOLDOWN_CREATE') && (
        <button
          onClick={() => setShowCreatePopup(true)}
          className="create-button"
        >
          + Create Cooldown
        </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Cooldowns...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>duration</th>
                <th style={{padding: '4px 8px'}}>Start Interaction</th>
                <th style={{padding: '4px 8px'}}>End Interaction</th>
              </tr>
            </thead>
            <tbody>
              {filteredCooldowns.map((cd) => (
                <tr key={cd.id} style={{height: '32px'}} onClick={() => handleClick(cd.id)}>
                  <td style={{padding: '4px 8px'}}>{cd.id}</td>
                  <td style={{padding: '4px 8px'}}>{cd.duration}</td>
                  <td style={{padding: '4px 8px'}}>{cd.start_interaction}</td>
                  <td style={{padding: '4px 8px'}}>{cd.end_interaction}</td>
                </tr>
              ))}
              {filteredCooldowns.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching cooldowns found' : 'No cooldowns available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateCooldownPopup
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleCooldownCreated}
        />
      )}
    </div>
  );
};

export default CooldownTab;