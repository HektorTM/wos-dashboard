/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PlayerMetaBox from '../../components/PlayerMetaBox';
import { parseStringToArray, parseTime } from '../../utils/parser';

type PlayerTab = 'general' | 'friends' | 'unlockables' | 'stats' | 'cosmetics' | 'ecologs';

interface PlayerData {
  data?: Data[];
  nicknames?: Nicknames[];
  friends?: Friends[];
  unlockables?: Unlockables[];
  stats?: Stats[];
  cosmetics?: Cosmetics[];
  ecologs?: EcoLogs[];
}

interface Data {
  uuid: string;
  username: string;
  last_known_name: string;
  last_online: string;
}

interface Nicknames {
  nickname: string;
  previous_nicks: string[];
}

interface EcoLogs {
  timestamp: string;
  currency: string;
  previous_amount: bigint;
  new_amount: bigint;
  change_amount: bigint;
  source_type: string;
  source: string;
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
  const [error, setError] = useState('');
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState({
    general: 1,
    friends: 1,
    unlockables: 1,
    stats: 1,
    cosmetics: 1,
    ecologs: 1,
  });
  const [friendUsernames, setFriendUsernames] = useState<Record<string, string>>({});


  const paginate = <T,>(data: T[] | undefined, tab: PlayerTab): T[] => {
    if (!data) return [];
    const start = (currentPage[tab] - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };


  const handlePageChange = (tab: PlayerTab, direction: 'prev' | 'next', totalItems: number) => {
    setCurrentPage((prev) => {
      const maxPage = Math.ceil(totalItems / itemsPerPage);
      const newPage = direction === 'prev' ? Math.max(1, prev[tab] - 1) : Math.min(maxPage, prev[tab] + 1);
      return { ...prev, [tab]: newPage };
    });
  };

  

useEffect(() => {
  const fetchUsernames = async () => {
    if (!playerdata?.friends || playerdata.friends.length === 0) {
      console.log("No friends to load");
      return;
    }

    try {
      const resolved: Record<string, string> = {};

      await Promise.all(
        playerdata.friends.map(async (friend) => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/playerdata/username/${friend.friend_uuid}`,
              { credentials: 'include' }
            );

            if (!res.ok) throw new Error("Failed to fetch username");

            const data = await res.json();
            console.log(`Fetched for ${friend.friend_uuid}:`, data);

            resolved[friend.friend_uuid] = data[0]?.username || 'Unknown';
          } catch (err) {
            console.error(`Error fetching username for ${friend.friend_uuid}`, err);
            resolved[friend.friend_uuid] = 'Unknown';
          }
        })
      );

      setFriendUsernames(resolved);
    } catch (error) {
      console.error("Something went wrong in fetchUsernames:", error);
    }
  };

  fetchUsernames();
}, [playerdata]);



  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playerdata/${uuid}`, {
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
            {renderTabHeader('general', 'General Information')}
            <div className="general-info">
              <table className="page-table">
                <tbody>
                  <tr>
                    <td><strong>Username:</strong></td>
                    <td>{`${playerdata.data?.[0]?.username}`}</td>
                  </tr>
                  <tr>
                    <td><strong>UUID:</strong></td>
                    <td>{`${playerdata.data?.[0]?.uuid}`}</td>
                  </tr>
                  {playerdata.nicknames && playerdata.nicknames.length > 0 && (
                    <tr>
                      <td><strong>Nicknames:</strong></td>
                      <td>
                        {playerdata.nicknames.map((nick, index) => (
                          <div key={index}>
                            <div><strong>Current:</strong> {nick.nickname}</div>
                            {nick.previous_nicks.length > 0 && (
                              <div>
                                <strong>Previous:</strong>
                                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                  {parseStringToArray(nick.previous_nicks.toString()).map((prev, i) => (
                                    <li key={i}>{prev}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>Total Friends:</strong></td>
                    <td>{playerdata.friends?.length || 0}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Unlockables:</strong></td>
                    <td>{playerdata.unlockables?.length || 0}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Stats:</strong></td>
                    <td>{playerdata.stats?.length || 0}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Cosmetics:</strong></td>
                    <td>{playerdata.cosmetics?.length || 0}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Economy Logs:</strong></td>
                    <td>{playerdata.ecologs?.length || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                        <td><img style={{width: "50px", height:"50px"}} src={`https://minotar.net/helm/${friend.friend_uuid}/100.png`}></img></td>
                        <td>{friendUsernames[friend?.friend_uuid] || 'Loading...'}</td>
                        <td><Link to={`/view/player/${friend.friend_uuid}`}>{friend.friend_uuid}</Link></td>
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
                    <tr style={{height: '32px'}}>
                      <th style={{padding: '4px 8px', width:'auto'}}>Identifier</th>
                      <th style={{padding: '4px 8px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(playerdata.unlockables, 'unlockables').map((unlockable) => (
                      <tr style={{height: '32px'}} key={unlockable.id}>
                        <td style={{padding: '4px 8px', width: '200px', cursor: 'pointer'}}>{unlockable.id}</td>
                        <td style={{padding: '4px 8px'}}>Remove</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='pagination'>
                  <button className='pagination-button'
                    disabled={currentPage.unlockables === 1}
                    onClick={() => handlePageChange('unlockables', 'prev', playerdata.unlockables?.length || 0)}
                  >
                    Prev
                  </button>
                  <span>
                    Page {currentPage.ecologs} of {Math.ceil((playerdata.unlockables?.length || 0) / itemsPerPage)}
                  </span>
                  <button className='pagination-button'
                    disabled={currentPage.ecologs >= Math.ceil(playerdata.unlockables.length / itemsPerPage)}
                    onClick={() => handlePageChange('unlockables', 'next', playerdata.unlockables?.length || 0)}
                  >
                    Next
                  </button>
                </div>
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
                    <tr style={{height: '32px'}}>
                      <th style={{padding: '4px 8px'}}>Identifier</th>
                      <th style={{padding: '4px 8px'}}>Value</th>
                      <th style={{padding: '4px 8px'}}>Actions</th> 
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(playerdata.stats, 'stats').map((stat) => (
                      <tr style={{height: '32px'}} key={stat.id}>
                        <td style={{padding: '4px 8px', width: '200px'}}>{stat.id}</td>
                        <td style={{padding: '4px 8px'}}>{stat.value}</td>
                        <td style={{padding: '4px 8px'}}>Modify</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='pagination'>
                  <button className='pagination-button'
                    disabled={currentPage.stats === 1}
                    onClick={() => handlePageChange('stats', 'prev', playerdata.stats?.length || 0)}
                  >
                    Prev
                  </button>
                  <span>
                    Page {currentPage.ecologs} of {Math.ceil((playerdata.stats?.length || 0) / itemsPerPage)}
                  </span>
                  <button className='pagination-button'
                    disabled={currentPage.ecologs >= Math.ceil(playerdata.stats.length / itemsPerPage)}
                    onClick={() => handlePageChange('stats', 'next', playerdata.stats?.length || 0)}
                  >
                    Next
                  </button>
                </div>
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
                    <tr style={{height: '32px'}}>
                      <th style={{padding: '4px 8px'}}>Type</th>
                      <th style={{padding: '4px 8px'}}>Identifier</th>
                      <th style={{padding: '4px 8px'}}>Equipped?</th>
                      <th style={{padding: '4px 8px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(playerdata.cosmetics, 'cosmetics').map((cosmetic) => (
                      <tr style={{height: '32px'}} key={cosmetic.cosmetic_id}>
                        <td style={{padding: '4px 8px'}}>{cosmetic.cosmetic_type}</td>
                        <td style={{padding: '4px 8px'}}>{cosmetic.cosmetic_id}</td>
                        <td style={{padding: '4px 8px'}}>{cosmetic.equipped ? "Yes" : "No"}</td>
                        <td style={{padding: '4px 8px'}}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='pagination'>
                  <button className='pagination-button'
                    disabled={currentPage.cosmetics === 1}
                    onClick={() => handlePageChange('cosmetics', 'prev', playerdata.cosmetics?.length || 0)}
                  >
                    Prev
                  </button>
                  <span>
                    Page {currentPage.ecologs} of {Math.ceil((playerdata.cosmetics?.length || 0) / itemsPerPage)}
                  </span>
                  <button className='pagination-button'
                    disabled={currentPage.ecologs >= Math.ceil(playerdata.cosmetics.length / itemsPerPage)}
                    onClick={() => handlePageChange('cosmetics', 'next', playerdata.cosmetics?.length || 0)}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p>No Cosmetics found.</p>
            )}
          </div>
        );

      case 'ecologs':
        return (
          <div className="tab-content">
            {renderTabHeader('ecologs', 'Eco Logs')}
            {playerdata.ecologs?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr style={{height: '32px'}}>
                      <th style={{padding: '4px 8px'}}>Timestamp</th>
                      <th style={{padding: '4px 8px'}}>Currency</th>
                      <th style={{padding: '4px 8px'}}>Previous Amount</th>
                      <th style={{padding: '4px 8px'}}>New Amount</th>
                      <th style={{padding: '4px 8px'}}>Change Amount</th>
                      <th style={{padding: '4px 8px'}}>Source Type</th>
                      <th style={{padding: '4px 8px'}}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(
                      [...(playerdata.ecologs || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
                      'ecologs'
                    ).map((log) => (
                        <tr style={{height: '32px'}}>
                          <td style={{padding: '4px 8px'}}>{parseTime(log.timestamp)}</td>
                          <td style={{padding: '4px 8px'}}>{log.currency}</td>
                          <td style={{padding: '4px 8px'}}>{log.previous_amount.toString()}</td>
                          <td style={{padding: '4px 8px'}}>{log.new_amount.toString()}</td>
                          <td style={{padding: '4px 8px'}}>{log.change_amount.toString()}</td>
                          <td style={{padding: '4px 8px'}}>{log.source_type}</td>
                          <td style={{padding: '4px 8px'}}>{log.source}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className='pagination'>
                  <button className='pagination-button'
                    disabled={currentPage.ecologs === 1}
                    onClick={() => handlePageChange('ecologs', 'prev', playerdata.ecologs?.length || 0)}
                  >
                    Prev
                  </button>
                  <span>
                    Page {currentPage.ecologs} of {Math.ceil((playerdata.ecologs?.length || 0) / itemsPerPage)}
                  </span>
                  <button className='pagination-button'
                    disabled={currentPage.ecologs >= Math.ceil(playerdata.ecologs.length / itemsPerPage)}
                    onClick={() => handlePageChange('ecologs', 'next', playerdata.ecologs?.length || 0)}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p>No Eco Logs found</p>
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
          <PlayerMetaBox uuid={uuid!} />
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
            <button
              className={`tab-button ${activeTab === 'ecologs' ? 'active' : ''}`}
              onClick={() => setActiveTab('ecologs')}
            >
              Economy Logs
            </button>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ViewPlayer;