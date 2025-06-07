
import { useEffect, useState } from 'react';
import { parseTime } from '../utils/parser';
import { useNavigate } from 'react-router-dom';

interface PlayerMetaBoxProps {
  uuid: string;
}

interface PlayerData {
  uuid: string;
  username: string;
  last_online: string;
  //join_date?: string;
  //time_played?: string;
}

const PlayerMetaBox: React.FC<PlayerMetaBoxProps> = ({ uuid }) => {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const backToList = async () => {
    const destination = "players";
    navigate(`/${destination}`)
  }

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playerdata/${uuid}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load PlayerData');
      const result = await res.json();
      setData(result.data[0]);
    } catch (err) {
      console.error(err);
      setError('Error loading PlayerData');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, [uuid]);

  return (
    <div style={{ flex: 1 }}>
      <div className="info-box">
        <h4>Player</h4>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>Username</strong> <br /> {`${data?.username}`}</li>
              <li><strong>Unique User ID</strong> <br /> {uuid}</li>
              <li><strong>Last Online</strong> <br />{parseTime(`${data?.last_online}`)}</li>
            </ul>
          </>
        )}
      </div>
      <div className="info-box">
        <h4>Actions</h4>
        {data && (
          <>
            <button className="meta-page-button">Add Comment</button>
            <button onClick={backToList} className="meta-page-button">
              Back to List 
            </button>
          </>
        )}
      </div>
    </div>
    
    
  );
};

export default PlayerMetaBox;
