import {useEffect, useMemo, useState} from 'react';
import { parseMinecraftColorCodes } from '../../utils/parser';
import { useTheme } from '../../context/ThemeContext';
import TitleComp from '../../components/TitleComponent';

type WebData = {
  material: string;
  display_name?: string | null;
  lore?: string[] | null;
  enchanted?: boolean;
  ['left-click']?: string | null;
  ['right-click']?: string | null;
}

type Citem = {
  id: string;
  web_data: WebData | string;
};

function coerceWebData(input: WebData | string | null | undefined): WebData {
  if (!input) return { material: 'BARRIER' };
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return parsed ?? { material: 'BARRIER' };
    } catch {
      return { material: 'BARRIER' };
    }
  }
  return input;
}

const CitemTab = () => {
  const [citems, setCitems] = useState<Citem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {theme} = useTheme();

  useEffect(() => {
    const fetchCitems = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/citems`,
          {credentials: 'include',}
        );
        if (!res.ok) throw new Error('Failed to fetch citems');
        const data = (await res.json() as Citem[]);
        setCitems(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load citems. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCitems();
  }, []);

  const deleteCitem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Citem?')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/citems/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to delete');
      
      setCitems(citems.filter((citem) => citem.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete citem. Please try again.');
    }
  };

  const rows = useMemo(() => {
    return citems.map((c) => {
      const wd = coerceWebData(c.web_data);
      return {
        id: c.id,
        material: wd.material ?? 'BARRIER',
        displayName: wd.display_name ?? '',
        lore: wd.lore ?? [],
        enchanted: !!wd.enchanted,
        leftAction: wd['left-click'] ?? '',
        rightAction: wd['right-click'] ?? '',
      };
    });
  }, [citems]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
        [
          r.id,
          r.material,
          r.displayName,
          r.leftAction,
          r.rightAction,
          ...(r.lore || []),
        ]
            .join(' ')
            .toLowerCase()
            .includes(q)
    );
  }, [rows, search]);

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Citems | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Citem Management</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search citems..."
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
          <p>Loading citems...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Material</th>
                <th style={{padding: '4px 8px'}}>Display Name</th>
                <th style={{padding: '4px 8px'}}>Lore</th>
                <th style={{padding: '4px 8px'}}>Enchanted</th>
                <th style={{padding: '4px 8px'}}>Left Action</th>
                <th style={{padding: '4px 8px'}}>Right Action</th>
                <th style={{padding: '4px 8px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((citem) => (
                <tr key={citem.id} style={{height: '32px'}}>
                  <td style={{padding: '4px 8px'}}>{citem.id}</td>
                  <td style={{padding: '4px 8px'}}>
                    <img 
                      src={`https://mc.nerothe.com/img/1.21.4/minecraft_${citem.material.toLowerCase()}.png`}
                      alt={citem.material}
                      title={citem.material}
                      className="material-icon"
                    />
                  </td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{parseMinecraftColorCodes(citem.displayName)}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{parseMinecraftColorCodes(citem.lore.join("\n"))}</td>
                  <td style={{padding: '4px 8px'}} className="boolean-cell">{citem.enchanted ? '✅'  : '❌'}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{citem.leftAction}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{citem.rightAction}</td>
                  <td style={{padding: '4px 8px'}}>
                    <button
                      className="action-btn"
                      onClick={() => deleteCitem(citem.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="no-results">
                    {search ? 'No matching citems found' : 'No citems available'}
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

export default CitemTab;