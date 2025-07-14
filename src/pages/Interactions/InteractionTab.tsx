import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import CreateInteractionPopUp from './CreateInteractionPopUp';
import TitleComp from '../../components/TitleComponent';
import {usePermission} from "../../utils/usePermission.ts";
import {useNavigate} from "react-router-dom";

type Interaction = {
  id: string;
};

const InteractionTab = () => {
  const { theme } = useTheme();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load interactions');
        const data = await res.json();
        setInteractions(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load interactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []);

  const handleClick = (id:string) => {
    if (hasPermission('INTERACTION_EDIT')) {
      navigate(`/view/interaction/${id}`);
    } else {
      return;
    }
  };

  const handleInteractionCreated = (newInteraction: Interaction) => {
    setInteractions([...interactions, newInteraction]);
  }

  const filteredInteractions = interactions.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Interactions | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Interactions</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search interactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        {hasPermission('INTERACTION_CREATE') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Interaction
        </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading interactions...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredInteractions.map((interaction) => (
                <tr key={interaction.id} style={{height: '32px'}} onClick={() => handleClick(interaction.id)}>
                  <td style={{padding: '4px 8px'}}>{interaction.id}</td>
                </tr>
              ))}
              {filteredInteractions.length === 0 && (
                <tr>
                  <td colSpan={3} className="no-results">
                    {search ? 'No matching interactions found' : 'No interactions available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateInteractionPopUp 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleInteractionCreated}
        />
      )}

    </div>
  );
};

export default InteractionTab;
