import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Currency = {
  id: string;
  name: string;
  shortName: string;
  icon: string ;
  color: string;
  hiddenIfZero: number;
};

const CurrencyTab = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/currencies');
        const data = await res.json();
        setCurrencies(data);
      } catch (err) {
        console.error(err);
        alert('Failed to load currencies.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const deleteCurrency = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this currency?');
    if (confirmed) {
      try {
        const res = await fetch(`http://localhost:3001/api/currencies/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setCurrencies(currencies.filter((currency) => currency.id !== id));
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

  const filteredCurrencies = currencies.filter((c) =>
    [c.id, c.name, c.shortName].some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Currencies</h3>
        <Link to="/currencies/create" className="btn btn-primary">
          + Create Currency
        </Link>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by ID, name, short name..."
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
                <th>Icon</th>
                <th>ID</th>
                <th>Name</th>
                <th>Short Name</th>
                <th>Color</th>
                <th>Hidden if Zero</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCurrencies.map((currency) => (
                <tr key={currency.id}>
                  <td>{currency.icon}</td>
                  <td>{currency.id}</td>
                  <td>{currency.name}</td>
                  <td>{currency.shortName}</td>
                  <td>{currency.color}</td>
                  <td>{currency.hiddenIfZero ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => navigate(`/currencies/edit/${currency.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteCurrency(currency.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCurrencies.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No currencies found.
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

export default CurrencyTab;
