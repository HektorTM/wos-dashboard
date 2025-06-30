import { useEffect, useState } from 'react';
import { parseMinecraftColorCodes } from '../../utils/parser';
import { useTheme } from '../../context/ThemeContext';
import TitleComp from '../../components/TitleComponent';

type Citem = {
  id: string;
  material: string;
  display_name: string;
  lore: string;
  enchantments: string;
  custom_model_data: number;
  flag_undroppable: number;
  flag_unusable: number;
  flag_placeable: number;
  flag_profile_bg: string;
  flag_profile_picture: string;
  action_left: string;
  action_right: string;
};

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
        const data = await res.json();
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

  const filteredCitems = citems.filter((c) =>
    [c.id, c.material, c.display_name, c.lore, c.custom_model_data, c.flag_profile_bg, c.flag_profile_picture]
      .some((field) => String(field || '').toLowerCase().includes(search.toLowerCase()))
  );

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
                <th style={{padding: '4px 8px'}}>Enchantments</th>
                <th style={{padding: '4px 8px'}}>Model Data</th>
                <th style={{padding: '4px 8px'}}>Undroppable</th>
                <th style={{padding: '4px 8px'}}>Unusable</th>
                <th style={{padding: '4px 8px'}}>Placeable</th>
                <th style={{padding: '4px 8px'}}>Profile BG</th>
                <th style={{padding: '4px 8px'}}>Profile Pic</th>
                <th style={{padding: '4px 8px'}}>Left Action</th>
                <th style={{padding: '4px 8px'}}>Right Action</th>
                <th style={{padding: '4px 8px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCitems.map((citem) => (
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
                  <td style={{padding: '4px 8px'}} className="text-cell">{parseMinecraftColorCodes(citem.display_name)}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{parseMinecraftColorCodes(citem.lore)}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{citem.enchantments}</td>
                  <td style={{padding: '4px 8px'}}>{citem.custom_model_data}</td>
                  <td style={{padding: '4px 8px'}} className="boolean-cell">{citem.flag_undroppable ? '✅' : '❌'}</td>
                  <td style={{padding: '4px 8px'}} className="boolean-cell">{citem.flag_unusable ? '✅' : '❌'}</td>
                  <td style={{padding: '4px 8px'}} className="boolean-cell">{citem.flag_placeable ? '✅' : '❌'}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{citem.flag_profile_bg}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{citem.flag_profile_picture}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{citem.action_left}</td>
                  <td style={{padding: '4px 8px'}} className="text-cell">{citem.action_right}</td>
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
              {filteredCitems.length === 0 && (
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