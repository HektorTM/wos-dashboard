import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TitleComp from '../../components/TitleComponent';
import CreateGuiPopup from './CreateGuiPopUp';
import {usePermission} from "../../utils/usePermission.ts";
import {useNavigate} from "react-router-dom";

type Gui = {
  id: string;
};

const GuiTab = () => {
  const { theme } = useTheme();
  const [guis, setGuis] = useState<Gui[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchGuis = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/guis`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load GUIs');
        const data = await res.json();
        setGuis(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load GUIs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuis();
  }, []);

  const handleClick = (id: string) => {
    if (hasPermission('portal.guis.modify')) {
      navigate(`/view/gui/${id}`);
    } else {
      return
    }
  }

  const handleGuiCreated = (newGui: Gui) => {
    setGuis([...guis, newGui]);
  }

  const filteredGuis = guis.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`GUIs | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>GUIs</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search interactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        {hasPermission('portal.guis.create') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create GUI
        </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading GUIs...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuis.map((gui) => (
                <tr key={gui.id} style={{height: '32px'}} onClick={() => handleClick(gui.id)}>
                  <td style={{padding: '4px 8px'}}>{gui.id}</td>
                </tr>
              ))}
              {filteredGuis.length === 0 && (
                <tr>
                  <td colSpan={3} className="no-results">
                    {search ? 'No matching GUIs found' : 'No GUIs available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateGuiPopup 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleGuiCreated}
        />
      )}

    </div>
  );
};

export default GuiTab;
