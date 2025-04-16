import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ViewCurrency = () => {
  const { authUser } = useAuth();
  const { id } = useParams(); // Extract the currency ID from the URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currency, setCurrency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/currencies/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setCurrency(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch currency details.');
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
      short_name: currency.short_name,
      icon: currency.icon || null,
      color: currency.color,
      hidden_if_zero: currency.hidden_if_zero ? 1 : 0,
      uuid: authUser?.uuid,
    };
  
    try {
      const res = await fetch(`http://localhost:3001/api/currencies/${id}`, {
        method: 'PUT',
        credentials: 'include',
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
      setError('Failed to update currency');
    }
  };
  

  return (
    <div className={`page-container ${theme}`}>
      <h2>Edit Currency</h2>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading Currency...</p>
        </div>
      ) : currency ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              className="form-control"
              value={currency.id}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={currency.name}
              onChange={(e) => setCurrency({ ...currency, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Short Name</label>
            <input
              type="text"
              className="form-control"
              value={currency.short_name}
              onChange={(e) => setCurrency({ ...currency, short_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Icon</label>
            <input
              type="text"
              className="form-control"
              value={currency.icon}
              onChange={(e) => setCurrency({ ...currency, icon: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input
              type="text"
              className="form-control"
              value={currency.color}
              onChange={(e) => setCurrency({ ...currency, color: e.target.value })}
            />
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={currency.hidden_if_zero === 1}
              onChange={(e) =>
                setCurrency({
                  ...currency,
                  hidden_if_zero: e.target.checked ? 1 : 0,
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
      ) : (
        <p>Currency not found</p>
      )}
    </div>
  );
};

export default ViewCurrency;
