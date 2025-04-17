import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/page-data/${type}/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load metadata');
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError('Error loading metadata');
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [type, id]);

  return (
    <div style={{ flex: 1 }}>
        <div className="info-box">
        <h4>Page Info</h4>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><strong>ID:</strong> {id}</li>
            <li><strong>Created By:</strong> {data.created_by || '—'}</li>
            <li><strong>Last Edited By:</strong> {data.edited_by || '—'}</li>
            <li><strong>Locked:</strong> {data.locked ? 'Yes' : 'No'}</li>
            </ul>
        )}
        </div>
    </div>
  );
};

export default PageMetaBox;
