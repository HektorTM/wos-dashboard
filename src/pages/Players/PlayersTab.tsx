import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import TitleComp from '../../components/TitleComponent';

type Player = {
  username: string;
  uuid: string;
};

const PlayerTab = () => {
  const { theme } = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playerdata`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load players');
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load players. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleClick = async (uuid: string) => {
    navigate(`/view/player/${uuid}`)
  }

  const filteredPlayers = players.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Players | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Players</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search players..."
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
          <p>Loading players...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>Username</th>
                <th style={{padding: '4px 8px'}}>UUID</th>
              </tr>
            </thead>
            <tbody>
                {filteredPlayers.map((player) => (
                <tr key={player.username} onClick={() => handleClick(player.uuid)} style={{height: '32px', cursor: 'pointer'}}>
                  <td style={{padding: '4px 8px'}}>{player.username}</td>
                  <td style={{padding: '4px 8px'}}>{player.uuid}</td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={3} className="no-results">
                    {search ? 'No matching players found' : 'No players available'}
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

export default PlayerTab;
