import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import CreateUnlockablePopUp from './CreateUnlockablePopUp';
import TitleComp from '../../components/TitleComponent';
import {useNavigate} from "react-router-dom";
import {usePermission} from "../../utils/usePermission.ts";

type Unlockable = {
  id: string;
  temp: number;
};

const UnlockableTab = () => {
  const { theme } = useTheme();
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

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

  const handleClick = (id:string) => {
    if (hasPermission('UNLOCKABLE_EDIT')) {
      navigate(`/view/unlockable/${id}`);
    } else {
      return;
    }
  };

  const handleUnlockableCreated = (newUnlockable: Unlockable) => {
    setUnlockables([...unlockables, newUnlockable]);
  }

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
        {hasPermission('UNLOCKABLE_CREATE') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Unlockable
        </button>
        )}
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
              </tr>
            </thead>
            <tbody>
              {filteredUnlockables.map((unlockable) => (
                <tr key={unlockable.id} style={{height: '32px'}} onClick={() => handleClick(unlockable.id)}>
                  <td style={{padding: '4px 8px'}}>{unlockable.id}</td>
                  <td style={{padding: '4px 8px'}}>{unlockable.temp ? 'Temporary' : 'Permanent'}</td>
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
