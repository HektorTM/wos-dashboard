import { useEffect, useState } from 'react';
import { parseMinecraftColorCodes } from '../../utils/parser';

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
    <div className={'page-container §{theme}'}>
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
              <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Display Name</th>
                <th>Lore</th>
                <th>Enchantments</th>
                <th>Model Data</th>
                <th>Undroppable</th>
                <th>Unusable</th>
                <th>Placeable</th>
                <th>Profile BG</th>
                <th>Profile Pic</th>
                <th>Left Action</th>
                <th>Right Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCitems.map((citem) => (
                <tr key={citem.id}>
                  <td>{citem.id}</td>
                  <td>
                    <img 
                      src={`https://mc.nerothe.com/img/1.21.4/minecraft_${citem.material.toLowerCase()}.png`}
                      alt={citem.material}
                      title={citem.material}
                      className="material-icon"
                    />
                  </td>
                  <td className="text-cell">{parseMinecraftColorCodes(citem.display_name)}</td>
                  <td className="text-cell">{parseMinecraftColorCodes(citem.lore)}</td>
                  <td className="text-cell">{citem.enchantments}</td>
                  <td>{citem.custom_model_data}</td>
                  <td className="boolean-cell">{citem.flag_undroppable ? '✅' : '❌'}</td>
                  <td className="boolean-cell">{citem.flag_unusable ? '✅' : '❌'}</td>
                  <td className="boolean-cell">{citem.flag_placeable ? '✅' : '❌'}</td>
                  <td className="text-cell">{citem.flag_profile_bg}</td>
                  <td className="text-cell">{citem.flag_profile_picture}</td>
                  <td className="text-cell">{citem.action_left}</td>
                  <td className="text-cell">{citem.action_right}</td>
                  <td>
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