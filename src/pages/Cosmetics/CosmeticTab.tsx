import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { parseMinecraftColorCodes } from '../../utils/parser';

const api = 'http://localhost:3001/api';
const api_sub1 = '/titles';
const api_sub2 = '/badges';

type CosmeticBase = {
  id: string;
  description: string;
};

type Title = CosmeticBase & {
  title: string;
  type: 'Title';
};

type Badge = CosmeticBase & {
  badge: string;
  type: 'Badge';
};

type Cosmetic = Title | Badge;

const CosmeticTab = () => {
  const { theme } = useTheme();
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [titlesRes, badgesRes] = await Promise.all([
          fetch(api + api_sub1, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch(api + api_sub2, {
            method: 'GET',
            credentials: 'include',
          }),
        ]);

        const [titlesData, badgesData] = await Promise.all([
          titlesRes.json(),
          badgesRes.json(),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedTitles: Title[] = titlesData.map((t: any) => ({
          ...t,
          type: 'Title',
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedBadges: Badge[] = badgesData.map((b: any) => ({
          ...b,
          type: 'Badge',
        }));

        setCosmetics([...formattedTitles, ...formattedBadges]);
      } catch (err) {
        console.error(err);
        setError('Failed to load cosmetics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteCosmetic = async (item: Cosmetic) => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${item.type}?`);
    if (!confirmed) return;

    try {
      const endpoint = item.type === 'Title' ? api_sub1 : api_sub2;
      const res = await fetch(`${api}${endpoint}/${item.id}`, { method: 'DELETE' });

      if (res.ok) {
        setCosmetics((prev) => prev.filter((u) => u.id !== item.id));
      } else {
        setError(`Error deleting ${item.type}.`);
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to delete ${item.type}.`);
    }
  };

  const filteredCosmetics = cosmetics.filter((c) =>
    [c.id.toLowerCase(), c.type.toLowerCase()].some((field) =>
      field.includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <div className="page-header">
        <h2>Cosmetics</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID or Type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <Link to="/create/cosmetic" className="primary-action">
          + Create Cosmetic
        </Link>
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
                  <td>
                    {cosmetic.type === 'Title'
                      ? parseMinecraftColorCodes(cosmetic.title)
                      : parseMinecraftColorCodes(cosmetic.badge)}
                  </td>
                  <td>{cosmetic.description}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() =>
                        navigate(`/view/${cosmetic.type.toLowerCase()}/${cosmetic.id}`)
                      }
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => deleteCosmetic(cosmetic)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCosmetics.length === 0 && (
                <tr>
                  <td colSpan={5} className="no-results">
                    {search ? 'No matching cosmetics found' : 'No cosmetics available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CosmeticTab;
