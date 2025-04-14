import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditUnlockable = () => {
  const { id } = useParams(); // Extract the currency ID from the URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [unlockable, setUnlockable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/unlockables/${id}`);
        const data = await res.json();
        setUnlockable(data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch currency details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrency();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const updatedUnlockable = {
      name: unlockable.name,
      temp: unlockable.temp ? 1 : 0,
    };
  
    try {
      const res = await fetch(`http://localhost:3001/api/unlockables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUnlockable),
      });
  
      if (res.ok) {
        alert('Unlockable updated!');
        navigate('/unlockables'); // Redirect after update
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error updating unlockalbe');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update unlockable');
    }
  };
  

  return (
    <div className="container mt-4">
      <h3>Edit Unlockable</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">ID</label>
            <input
              type="text"
              className="form-control"
              value={unlockable.id}
              disabled
            />
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={unlockable.temp === 1}
              onChange={(e) =>
                setUnlockable({
                  ...unlockable,
                  temp: e.target.checked ? 1 : 0,
                })
              }
            />
            <label className="form-check-label">
              Temporary
            </label>
          </div>

          <button type="submit" className="btn btn-success">
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default EditUnlockable;
