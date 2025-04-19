import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseUUIDToUsername } from '../utils/parser';

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
  const [toggling, setToggling] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [editorName, setEditorName] = useState<string | null>(null);
  const { authUser } = useAuth();

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
        <h4>Page Info</h4>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>ID:</strong> {id}</li>
              <li><strong>Created By:</strong> {creatorName || '—'}</li>
              <li><strong>Last Edited By:</strong> {editorName || '—'}</li>
              <li><strong>Locked:</strong> {data.locked ? 'Yes' : 'No'}</li>
            </ul>
            <button onClick={toggleLock} disabled={toggling}>
              {data.locked ? 'Unlock Page' : 'Lock Page'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PageMetaBox;
