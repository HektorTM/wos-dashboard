import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DeleteButton from '../../components/DeleteButton';
import EditButton from '../../components/EditButton';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateStatPopup from './CreateStatPopUp'; // Adjust the import path as needed
import TitleComp from '../../components/TitleComponent';

type Stat = {
  id: string;
  max: string;
  capped: number;
};

const StatsTab = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<Stat[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authUser } = useAuth();
  
  // State for the popup
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchType('stats');
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load stats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleStatCreated = (newStat: Stat) => {
    setStats([...stats, newStat]);
  }

  const deleteStat = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Stat?')) return;

    try {
      deletePageItem('stats', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('stat', `${id}`, `${authUser?.uuid}`);
      setStats(stats.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete stat. Please try again.');
    }
  };



  const filteredStats = stats.filter((c) =>
    [c.id].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Stats | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Stats</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Stat
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading stats...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Maximum</th>
                <th>Capped?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat) => (
                <tr key={stat.id}>
                  <td>{stat.id}</td>
                  <td>{stat.max}</td>
                  <td>{stat.capped ? '✅' : '❌'}</td>
                  <td>
                    <EditButton perm='STATS_EDIT' nav={`/view/stat/${stat.id}`} />
                    <DeleteButton perm='STATS_DELETE' onClick={() => deleteStat(stat.id)} />
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching stats found' : 'No stats available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateStatPopup 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleStatCreated}
        />
      )}
    </div>
  );
};

export default StatsTab;