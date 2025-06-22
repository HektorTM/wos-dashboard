import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DeleteButton from '../../components/DeleteButton';
import EditButton from '../../components/EditButton';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateCosmeticPopup from './CreateCosmeticPopUp';
import { parseMinecraftColorCodes } from '../../utils/parser';
import TitleComp from '../../components/TitleComponent';

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
  const { authUser } = useAuth();

  const [showCreatePopup, setShowCreatePopup] = useState(false);

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
    setCosmetics([...cosmetics, newCosmetic]);
  }

  const deleteCosmetic = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Cosmetic?')) return;

    try {
      deletePageItem('cosmetics', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('cosmetic', `${id}`, `${authUser?.uuid}`);
      setCosmetics(cosmetics.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete cosmetic. Please try again.');
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
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Cosmetic
        </button>
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
              <tr>
                <th>Type</th>
                <th>ID</th>
                <th>Display</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCosmetics.map((cosmetic) => (
                <tr key={cosmetic.id}>
                  <td>{cosmetic.type}</td>
                  <td>{cosmetic.id}</td>
                  <td>{parseMinecraftColorCodes(cosmetic.display)}</td>
                  <td>{parseMinecraftColorCodes(cosmetic.description)}</td>
                  <td>
                    <EditButton perm='COSMETIC_EDIT' nav={`/view/cosmetic/${cosmetic.id}`} ></EditButton>
                    <DeleteButton perm='COSMETIC_DELETE' onClick={() => deleteCosmetic(cosmetic.id)}></DeleteButton>
                  </td>
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

    </div>
  );
};

export default CurrencyTab;
