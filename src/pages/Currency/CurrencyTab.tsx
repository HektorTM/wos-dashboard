import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchType } from '../../helpers/FetchPageItem';
import CreateCurrencyPopup from './CreateCurrencyPopUp';
import TitleComp from '../../components/TitleComponent';
import {usePermission} from "../../utils/usePermission.ts";
import {useNavigate} from "react-router-dom";

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
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

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

  const handleClick = (id:string) => {
    if (hasPermission('CURRENCY_EDIT')) {
      navigate(`/view/currency/${id}`);
    } else {
      return;
    }
  };

  const handleCurrencyCreated = (newCurrency: Currency) => {
    setCurrencies([...currencies, newCurrency]);
  }

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
        {hasPermission('CURRENCY_CREATE') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Currency
        </button>
        )}
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
              </tr>
            </thead>
            <tbody>
              {filteredCurrencies.map((currency) => (
                <tr key={currency.id} style={{height: '32px'}} onClick={() => handleClick(currency.id)}>
                  <td style={{padding: '4px 8px'}}>{currency.icon}</td>
                  <td style={{padding: '4px 8px'}}>{currency.id}</td>
                  <td style={{padding: '4px 8px'}}>{currency.name}</td>
                  <td style={{padding: '4px 8px'}}>{currency.short_name}</td>
                  <td style={{padding: '4px 8px'}}>{currency.color}</td>
                  <td style={{padding: '4px 8px'}}>{currency.hidden_if_zero ? '✅' : '❌'}</td>
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
