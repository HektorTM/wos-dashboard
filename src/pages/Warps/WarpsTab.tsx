import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DeleteButton from '../../components/buttons/DeleteButton.tsx';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';

import TitleComp from '../../components/TitleComponent';

type Warp = {
  id: string;
  location: string;
};

const WarpsTab = () => {
  const { theme } = useTheme();
  const [warps, setWarps] = useState<Warp[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authUser } = useAuth();
  

  useEffect(() => {
    const fetchWarps = async () => {
      try {
        const data = await fetchType('warps');
        setWarps(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load warps. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWarps();
  }, []);

  const deleteWarp = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Warp?')) return;

    try {
      deletePageItem('warps', `${id}`, `${authUser?.uuid}`);
      setWarps(warps.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete warp. Please try again.');
    }
  };



  const filteredWarps = warps.filter((c) =>
    [c.id].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Warps | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Warps</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading warps...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarps.map((warp) => (
                <tr key={warp.id}>
                  <td>{warp.id}</td>
                  <td>{warp.location}</td>
                  <td>
                    <DeleteButton perm='WARP_DELETE' onClick={() => deleteWarp(warp.id)} />
                  </td>
                </tr>
              ))}
              {filteredWarps.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching warps found' : 'No warps available'}
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

export default WarpsTab;