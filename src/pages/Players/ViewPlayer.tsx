/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/PageMetaBox';
import Modal from '../../components/Modal';
import { parseUUIDToUsername } from '../../utils/parser';

type PlayerTab = 'general' | 'friends' | 'unlockables' | 'stats' | 'cosmetics';

interface PlayerData {
  uuid: string;
  username: string;
  nicknames?: Nicknames[];
  friends?: Friends[];
  unlockables?: Unlockables[];
  stats?: Stats[];
  cosmetics?: Cosmetics[];
}

interface Nicknames {
  nickname: string;
  previous_nicks: string[];
}

interface Friends {
  friend_uuid: string;
  favorite: boolean;
}

interface Unlockables {
  id: string;
}

interface Stats {
  id: string;
  value: bigint;
}

interface Cosmetics {
  cosmetic_id: string;
  cosmetic_type: string;
  equipped: boolean;
}

const ViewPlayer = () => {
  const { uuid } = useParams();
  const [playerdata, setPlayerData] = useState<PlayerData | null>(null);
  const [activeTab, setActiveTab] = useState<PlayerTab>('general');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/playerdata/${uuid}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setPlayerData({
          ...data
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Player details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [uuid]);
  
  const renderTabHeader = (tab: PlayerTab, title: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h3>{title}</h3>
    </div>
  );

  const renderTabContent = () => {
    if (!playerdata) return null;

    switch (activeTab) {
      case 'general':
        return (
          <div className="tab-content">
            {renderTabHeader('general', 'General')}
            {playerdata.unlockables?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Behaviour</th>
                      <th>Match Type</th>
                      <th>Conditions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerdata.unlockables?.map((action) => (
                      <tr key={action.id}>
                        <td>{action.id}</td>
                        <td>{action.id}</td>
                        <td>{action.id}</td>
                        <td>
                        </td>
                        <td>nothing</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No actions configured</p>
            )}
          </div>
        );

      case 'friends':
        return (
          <div className="tab-content">
            {renderTabHeader('friends', 'Friends')}
            {playerdata.friends?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Username</th>
                      <th>UUID</th>
                      <th>Favorite?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerdata.friends.map((friend) => (
                      <tr key={friend.friend_uuid}>
                        <td>SKIN PNG</td>
                        <td>{parseUUIDToUsername(friend.friend_uuid)}</td>
                        <td><Link to={`/view/${friend.friend_uuid}`}>{friend.friend_uuid}</Link></td>
                        <td>{friend.favorite ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No Friends found</p>
            )}
          </div>
        );

      case 'unlockables':
        return (
          <div className="tab-content">
            {renderTabHeader('unlockables', 'Unlockables')}
            {playerdata.unlockables?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerdata.unlockables.map((unlockable) => (
                      <tr key={unlockable.id}>
                        <td>{unlockable.id}</td>
                        <td>Remove</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No unlockables found.</p>
            )}
          </div>
        );

      case 'stats':
        return (
          <div className="tab-content">
            {renderTabHeader('stats', 'Stats')}
            {playerdata.stats?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>Identifier</th>
                      <th>Value</th>
                      <th></th> 
                    </tr>
                  </thead>
                  <tbody>
                    {playerdata.stats.map((stat) => (
                      <tr key={stat.id}>
                        <td>{stat.id}</td>
                        <td>{stat.value}</td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No Stats found</p>
            )}
          </div>
        );

      case 'cosmetics':
        return (
          <div className="tab-content">
            {renderTabHeader('cosmetics', 'Cosmetics')}
            {playerdata.cosmetics?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Identifier</th>
                      <th>Equipped?</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerdata.cosmetics.map((cosmetic) => (
                      <tr key={cosmetic.cosmetic_id}>
                        <td>{cosmetic.cosmetic_type}</td>
                        <td>{cosmetic.cosmetic_id}</td>
                        <td>{cosmetic.equipped ? "Yes" : "No"}</td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No Cosmetics found.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`page-container ${theme}`}>
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading Player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`page-container ${theme}`}>
        <div className='error-message'>{error}</div>
      </div>
    );
  }

  return (
    <div className={`page-container ${theme}`}>
      <div className="content-wrapper" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div className="meta-box-wrapper" style={{ width: '350px' }}>
          <PageMetaBox type="player" id={uuid!} />
        </div>
        
        <div className="tabs-content-wrapper" style={{ flex: 1 }}>
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              Friends
            </button>
            <button
              className={`tab-button ${activeTab === 'unlockables' ? 'active' : ''}`}
              onClick={() => setActiveTab('unlockables')}
            >
              Unlockables
            </button>
            <button
              className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
            <button
              className={`tab-button ${activeTab === 'cosmetics' ? 'active' : ''}`}
              onClick={() => setActiveTab('cosmetics')}
            >
              Cosmetics
            </button>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ViewPlayer;