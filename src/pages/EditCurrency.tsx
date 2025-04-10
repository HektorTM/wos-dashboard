import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditCurrency = () => {
  const { id } = useParams(); // Extract the currency ID from the URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currency, setCurrency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/currencies/${id}`);
        const data = await res.json();
        setCurrency(data);
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
  
    const updatedCurrency = {
      name: currency.name,
      shortName: currency.shortName,
      icon: currency.icon || null,
      color: currency.color,
      hiddenIfZero: currency.hiddenIfZero ? 1 : 0,
    };
  
    try {
      const res = await fetch(`http://localhost:3001/api/currencies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCurrency),
      });
  
      if (res.ok) {
        alert('Currency updated!');
        navigate('/currencies'); // Redirect after update
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error updating currency');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update currency');
    }
  };
  

  return (
    <div className="container mt-4">
      <h3>Edit Currency</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">ID</label>
            <input
              type="text"
              className="form-control"
              value={currency.id}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={currency.name}
              onChange={(e) => setCurrency({ ...currency, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Short Name</label>
            <input
              type="text"
              className="form-control"
              value={currency.shortName}
              onChange={(e) => setCurrency({ ...currency, shortName: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Icon</label>
            <input
              type="text"
              className="form-control"
              value={currency.icon}
              onChange={(e) => setCurrency({ ...currency, icon: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input
              type="text"
              className="form-control"
              value={currency.color}
              onChange={(e) => setCurrency({ ...currency, color: e.target.value })}
            />
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={currency.hiddenIfZero === 1}
              onChange={(e) =>
                setCurrency({
                  ...currency,
                  hiddenIfZero: e.target.checked ? 1 : 0,
                })
              }
            />
            <label className="form-check-label">
              Hidden if Zero
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

export default EditCurrency;
