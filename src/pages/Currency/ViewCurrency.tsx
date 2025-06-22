import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/PageMetaBox';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import { fetchPageItem } from '../../helpers/FetchPageItem';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';

const ViewCurrency = () => {
  const { authUser } = useAuth();
  const { id } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currency, setCurrency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const fetchCurrencyAndMeta = async () => {
      try {
        const data = await fetchPageItem('currencies', `${id}`);
        setCurrency(data);

      } catch (err) {
        console.error(err);
        setError('Failed to fetch currency');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCurrencyAndMeta();
    }
  }, [id]);

  const fetchLockedValue = async () => {
    try {
      
      const result = await fetchLocked('currency', `${id}`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/currencies/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCurrency),
      });

      if (res.ok) {
        touchPageMeta('currency', `${id}`, `${authUser?.uuid}`);
        alert('Currency updated!');
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
      <TitleComp title={`Currency | ${id}`}></TitleComp>
      <div
        className="form-meta-container"
        style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
      >
        <PageMetaBox type="currency" id={id!} />
        <div style={{ flex: 3 }}>
          {error && <div className="error-message">{error}</div>}
          {locked && (
            <div className="alert alert-warning page-input">
              This currency is locked and cannot be edited.
            </div>
          )}

          {loading ? (
            <Spinner type="Currency" />
          ) : currency ? (
            <form onSubmit={handleSubmit}>
              {/* Wrapping all controls in a fieldset disabled when locked */}
              <fieldset disabled={locked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="form-group page-input">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currency.name}
                    onChange={(e) =>
                      setCurrency({ ...currency, name: e.target.value })
                    }
                    disabled={locked}
                  />
                </div>

                <div className="form-group page-input">
                  <label>Short Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currency.short_name}
                    onChange={(e) =>
                      setCurrency({ ...currency, short_name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group page-input">
                  <label>Icon</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currency.icon}
                    onChange={(e) =>
                      setCurrency({ ...currency, icon: e.target.value })
                    }
                  />
                </div>

                <div className="form-group page-input">
                  <label>Color</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currency.color}
                    onChange={(e) =>
                      setCurrency({ ...currency, color: e.target.value })
                    }
                  />
                </div>

                <div className="form-check page-input">
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
                  <label className="form-check-label">Hidden if Zero</label>
                </div>

                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
              </fieldset>
            </form>
          ) : (
            <p>Currency not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCurrency;
