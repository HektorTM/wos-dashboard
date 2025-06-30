import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DeleteButton from '../../components/DeleteButton';
import EditButton from '../../components/EditButton';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateCurrencyPopup from './CreateCurrencyPopUp';
import TitleComp from '../../components/TitleComponent';

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

  const [showCreatePopup, setShowCreatePopup] = useState(false);

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

  const handleCurrencyCreated = (newCurrency: Currency) => {
    setCurrencies([...currencies, newCurrency]);
  }

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
      <TitleComp title={`Currencies | Staff Portal`}></TitleComp>
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
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Currency
        </button>
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
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>Icon</th>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Name</th>
                <th style={{padding: '4px 8px'}}>Short Name</th>
                <th style={{padding: '4px 8px'}}>Color</th>
                <th style={{padding: '4px 8px'}}>Hidden if Zero</th>
                <th style={{padding: '4px 8px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCurrencies.map((currency) => (
                <tr key={currency.id} style={{height: '32px'}}>
                  <td style={{padding: '4px 8px'}}>{currency.icon}</td>
                  <td style={{padding: '4px 8px'}}>{currency.id}</td>
                  <td style={{padding: '4px 8px'}}>{currency.name}</td>
                  <td style={{padding: '4px 8px'}}>{currency.short_name}</td>
                  <td style={{padding: '4px 8px'}}>{currency.color}</td>
                  <td style={{padding: '4px 8px'}}>{currency.hidden_if_zero ? '✅' : '❌'}</td>
                  <td style={{padding: '4px 8px'}}>
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

      {showCreatePopup && (
        <CreateCurrencyPopup 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleCurrencyCreated}
        />
      )}

    </div>
  );
};

export default CurrencyTab;
