import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import EditButton from '../../components/EditButton';
import DeleteButton from '../../components/DeleteButton';
import { deletePageItem } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateInteractionPopUp from './CreateInteractionPopUp';
import TitleComp from '../../components/TitleComponent';

type Interaction = {
  id: string;
};

const InteractionTab = () => {
  const { theme } = useTheme();
  const { authUser } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleInteractionCreated = (newInteraction: Interaction) => {
    setInteractions([...interactions, newInteraction]);
  }

  const deleteInteraction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Interaction?')) return;
    
    try {
      deletePageItem('interactions', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('interaction', `${id}`, `${authUser?.uuid}`);
      setInteractions(interactions.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete interaction. Please try again.');
    }
  };

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
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Interaction
        </button>
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
              <tr>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInteractions.map((interaction) => (
                <tr key={interaction.id}>
                  <td>{interaction.id}</td>
                  <td>
                    <EditButton perm='INTERACTION_EDIT' nav={`/view/interaction/${interaction.id}`}></EditButton>
                    <DeleteButton perm='INTERACTION_DELETE' onClick={() => deleteInteraction(interaction.id)}></DeleteButton>
                  </td>
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
