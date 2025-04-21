import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DeleteButton from '../../components/DeleteButton';
import EditButton from '../../components/EditButton';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';
import { deletePageMeta, fetchLocked } from '../../helpers/PageMeta';

type Currency = {
  id: string;
  name: string;
  short_name: string;
  icon: string;
  color: string;
  hidden_if_zero: number;
};

const CurrencyTab = () => {
  const { theme } = useTheme();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authUser } = useAuth();
  const [locked, setLocked] = useState(false);


  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await fetchType('currencies');
        setCurrencies(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load currencies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const fetchLockedValue = async () => {
      try {
        
        const result = await fetchLocked('currency', id);
        if (result == 1) {
          setLocked(true);
        } else {
          setLocked(false);
        }
  
      } catch (err) {
        console.error(err);
      }
    }
    fetchLockedValue();

  const deleteCurrency = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this currency?')) return;

    try {
      deletePageItem('currencies', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('currency', `${id}`, `${authUser?.uuid}`);
      setCurrencies(currencies.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete currency. Please try again.');
    }
  };

  const filteredCurrencies = currencies.filter((c) =>
    [c.id, c.name, c.short_name].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <div className="page-header">
        <h2>Currencies</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID, name, short name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <Link to="/create/currency" className="primary-action">
          + Create Currency
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading currencies...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
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
                  <td>{currency.short_name}</td>
                  <td>{currency.color}</td>
                  <td>{currency.hidden_if_zero ? '✅' : '❌'}</td>
                  <td>
                    <EditButton perm='CURRENCY_EDIT' nav={`/view/currency/${currency.id}`} ></EditButton>
                    <DeleteButton perm='CURRENCY_DELETE' onClick={() => deleteCurrency(currency.id)}></DeleteButton>
                  </td>
                </tr>
              ))}
              {filteredCurrencies.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching currencies found' : 'No currencies available'}
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

export default CurrencyTab;
