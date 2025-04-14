import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [titlesRes, badgesRes] = await Promise.all([
          fetch(api + api_sub1),
          fetch(api + api_sub2),
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
        alert('Failed to load cosmetics.');
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
        alert(`${item.type} deleted!`);
      } else {
        alert(`Error deleting ${item.type}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to delete ${item.type}`);
    }
  };

  const filteredCosmetics = cosmetics.filter((c) =>
    [c.id.toLowerCase(), c.type.toLowerCase()].some((field) => field.includes(search.toLowerCase()))
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Cosmetics</h3>
        <Link to="/create/cosmetic" className="btn btn-primary">
          + Create Cosmetic
        </Link>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by ID or Type"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
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
                  <td>{cosmetic.type === 'Title' ? parseMinecraftColorCodes(cosmetic.title) : parseMinecraftColorCodes(cosmetic.badge)}</td>
                  <td>{cosmetic.description}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() =>
                        navigate(`/view/${cosmetic.type.toLowerCase()}/${cosmetic.id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteCosmetic(cosmetic)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCosmetics.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No Cosmetics found.
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
