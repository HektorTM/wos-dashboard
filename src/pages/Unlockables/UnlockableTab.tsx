import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Unlockable = {
  id: string;
  temp: number;
};

const UnlockableTab = () => {
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnlockables = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/unlockables');
        const data = await res.json();
        setUnlockables(data);
      } catch (err) {
        console.error(err);
        alert('Failed to load currencies.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockables();
  }, []);

  const deleteUnlockable = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this Unlockable?');
    if (confirmed) {
      try {
        const res = await fetch(`http://localhost:3001/api/unlockables/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setUnlockables(unlockables.filter((Unlockable) => Unlockable.id !== id));
          alert('Currency deleted!');
        } else {
          alert('Error deleting currency');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete currency');
      }
    }
  };

  const filteredUnlockables = unlockables.filter((c) =>
    [c.id].some((field) => field.toLowerCase().includes(search))
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Unlockables</h3>
        <Link to="/create/unlockable" className="btn btn-primary">
          + Create Unlockable
        </Link>
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
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnlockables.map((unlockable) => (
                <tr key={unlockable.id}>
                  <td>{unlockable.id}</td>
                  <td>{unlockable.temp ? 'Temporary' : 'Permanent'}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => navigate(`/view/unlockable/${unlockable.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteUnlockable(unlockable.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUnlockables.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No unlockables found.
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

export default UnlockableTab;
