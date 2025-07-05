import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import EditButton from '../../components/buttons/EditButton.tsx';
import DeleteButton from '../../components/buttons/DeleteButton.tsx';
import { deletePageItem } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateUnlockablePopUp from './CreateUnlockablePopUp';
import TitleComp from '../../components/TitleComponent';

type Unlockable = {
  id: string;
  temp: number;
};

const UnlockableTab = () => {
  const { theme } = useTheme();
  const { authUser } = useAuth();
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchUnlockables = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/unlockables`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load unlockables');
        const data = await res.json();
        setUnlockables(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load unlockables. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockables();
  }, []);

  const handleUnlockableCreated = (newUnlockable: Unlockable) => {
    setUnlockables([...unlockables, newUnlockable]);
  }

  const deleteUnlockable = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Unlockable?')) return;
    
    try {
      deletePageItem('unlockables', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('unlockable', `${id}`, `${authUser?.uuid}`);
      setUnlockables(unlockables.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete unlockable. Please try again.');
    }
  };

  const filteredUnlockables = unlockables.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Unlockables | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Unlockables</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search unlockables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Unlockable
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading unlockables...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Type</th>
                <th style={{padding: '4px 8px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnlockables.map((unlockable) => (
                <tr key={unlockable.id} style={{height: '32px'}}>
                  <td style={{padding: '4px 8px'}}>{unlockable.id}</td>
                  <td style={{padding: '4px 8px'}}>{unlockable.temp ? 'Temporary' : 'Permanent'}</td>
                  <td style={{padding: '4px 8px'}}>
                    <EditButton perm='UNLOCKABLE_EDIT' nav={`/view/unlockable/${unlockable.id}`}></EditButton>
                    <DeleteButton perm='UNLOCKABLE_DELETE' onClick={() => deleteUnlockable(unlockable.id)}></DeleteButton>
                  </td>
                </tr>
              ))}
              {filteredUnlockables.length === 0 && (
                <tr>
                  <td colSpan={3} className="no-results">
                    {search ? 'No matching unlockables found' : 'No unlockables available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateUnlockablePopUp 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleUnlockableCreated}
        />
      )}

    </div>
  );
};

export default UnlockableTab;
