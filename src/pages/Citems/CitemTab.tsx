import { useEffect, useState } from 'react';

type Citem = {
  id: string;
  material: string;
  displayname: string;
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

  useEffect(() => {
    const fetchCitems = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/citems');
        const data = await res.json();
        setCitems(data);
      } catch (err) {
        console.error(err);
        alert('Failed to load citems.');
      } finally {
        setLoading(false);
      }
    };

    fetchCitems();
  }, []);

  const deleteCitem = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this Citem?');
    if (confirmed) {
      try {
        const res = await fetch(`http://localhost:3001/api/citems/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setCitems(citems.filter((Citem) => Citem.id !== id));
          alert('Citem deleted!');
        } else {
          alert('Error deleting Citem');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete Citem');
      }
    }
  };

  const filteredCitems = citems.filter((c) =>
    [c.id, c.material, c.displayname, c.lore, c.custom_model_data, c.flag_profile_bg, c.flag_profile_picture].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Citems</h3>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Display Name</th>
                <th>Lore</th>
                <th>enchantments</th>
                <th>Custom Model Data</th>
                <th>Undroppable</th>
                <th>Unusable</th>
                <th>Placeable</th>
                <th>Profile Background</th>
                <th>Profile Picture</th>
                <th>Action Left</th>
                <th>Action Right</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCitems.map((citem) => (
                <tr key={citem.id}>
                  <td>{citem.id}</td>
                  <td>{citem.material}</td>
                  <td>{citem.displayname}</td>
                  <td>{citem.lore}</td>
                  <td>{citem.enchantments}</td>
                  <td>{citem.custom_model_data}</td>
                  <td>{citem.flag_undroppable ? 'True' : 'False'}</td>
                  <td>{citem.flag_unusable ? 'True' : 'False'}</td>
                  <td>{citem.flag_placeable ? 'True' : 'False'}</td>
                  <td>{citem.flag_profile_bg}</td>
                  <td>{citem.flag_profile_picture}</td>
                  <td>{citem.action_left}</td>
                  <td>{citem.action_right}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteCitem(citem.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCitems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No Citems found.
                  </td>
                </tr>//
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CitemTab;
