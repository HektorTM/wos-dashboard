import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchType } from '../../helpers/FetchPageItem';
import CreateStatPopup from './CreateStatPopUp'; // Adjust the import path as needed
import TitleComp from '../../components/TitleComponent';
import {usePermission} from "../../utils/usePermission.ts";
import {useNavigate} from "react-router-dom";

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
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  
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

  const handleClick = (id:string) => {
    if (hasPermission('STATS_EDIT')) {
      navigate(`/view/stat/${id}`);
    } else {
      return;
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
        {hasPermission('STATS_CREATE') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Stat
        </button>
        )}
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
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Maximum</th>
                <th style={{padding: '4px 8px'}}>Capped?</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat) => (
                <tr key={stat.id} style={{height: '32px'}} onClick={() => handleClick(stat.id)}>
                  <td style={{padding: '4px 8px'}}>{stat.id}</td>
                  <td style={{padding: '4px 8px'}}>{stat.max}</td>
                  <td style={{padding: '4px 8px'}}>{stat.capped ? '✅' : '❌'}</td>
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