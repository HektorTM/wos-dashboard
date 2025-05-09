
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseTime, parseUUIDToUsername, toUpperCase } from '../utils/parser';
import { useNavigate } from 'react-router-dom';

interface PageMetaBoxProps {
  type: string;
  id: string;
}

interface PageData {
  created_by?: string;
  edited_by?: string;
  locked?: boolean;
  created_at?: string;
  edited_at?: string;
}

const PageMetaBox: React.FC<PageMetaBoxProps> = ({ type, id }) => {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [editorName, setEditorName] = useState<string | null>(null);
  const { authUser } = useAuth();

  const backToList = async () => {
    let destination = type;
    if (destination === "currency") {
      destination = "currencie";
    } 
    navigate(`/${destination}s`)
  }

  const fetchMeta = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/page-data/${type}/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load metadata');
      const result = await res.json();
      setData(result);

      if (result.created_by) {
        const name = await parseUUIDToUsername(result.created_by);
        setCreatorName(name);
      }

      if (result.edited_by) {
        const name = await parseUUIDToUsername(result.edited_by);
        setEditorName(name);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, [type, id]);

  const toggleLock = async () => {
    if (!data) return;
    setToggling(true);
    try {
      const res = await fetch(`http://localhost:3001/api/page-data/${type}/${id}/lock?uuid=${authUser?.uuid}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !data.locked }),
      });

      if (!res.ok) throw new Error('Failed to update lock status');

      await fetchMeta(); // Refresh metadata after lock change
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Could not toggle lock status');
    } finally {
      setToggling(false);
    }
  };


  return (
    <div style={{ flex: 1 }}>
      <div className="info-box">
        <h4>{toUpperCase(type?.toString())}</h4>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>Identifier</strong> <br /> {id}</li>
              <li><strong>Created By</strong> <br /> {creatorName || '—'}</li>
              <li><strong>Last Edited By</strong> <br /> {editorName || '—'} ( {parseTime(`${data?.edited_at}`)} )</li>
            </ul>
          </>
        )}
      </div>
      <div className="info-box">
        <h4>Actions</h4>
        {data && (
          <>
            <button onClick={toggleLock} disabled={toggling} className="meta-page-button">
              {data.locked ? 'Unlock Page' : 'Lock Page'}
            </button>
            <button onClick={backToList} disabled={toggling} className="meta-page-button">
              Back to List 
            </button>
          </>
        )}
      </div>
    </div>
    
  );
};

export default PageMetaBox;
