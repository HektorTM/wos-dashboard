import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/PageMetaBox';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import { fetchPageItem } from '../../helpers/FetchPageItem';
import Spinner from '../../components/Spinner';

const ViewCurrency = () => {
    const { authUser } = useAuth();
    const { id } = useParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cosmetic, setCosmetic] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        const fetchCurrencyAndMeta = async () => {
            try {
                const data = await fetchPageItem('cosmetics', `${id}`);
                setCosmetic(data);

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

            const result = await fetchLocked('cosmetic', `${id}`);
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
            type: cosmetic.type,
            display: cosmetic.display,
            description: cosmetic.description,
            uuid: authUser?.uuid,
        };

        try {
            const res = await fetch(`http://localhost:3001/api/cosmetics/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCurrency),
            });

            if (res.ok) {
                touchPageMeta('cosmetic', `${id}`, `${authUser?.uuid}`);
                alert('Cosmetic updated!');
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Error updating Cosmetic');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update Cosmetic');
        }
    };

    return (
        <div className={`page-container ${theme}`}>
            <h2>Edit Cosmetic</h2>
            <div
                className="form-meta-container"
                style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
            >
                <PageMetaBox type="cosmetic" id={id!} />
                <div style={{ flex: 3 }}>
                    {error && <div className="error-message">{error}</div>}
                    {locked && (
                        <div className="alert alert-warning page-input">
                            This Cosmetic is locked and cannot be edited.
                        </div>
                    )}

                    {loading ? (
                        <Spinner type="Cosmetic" />
                    ) : cosmetic ? (
                        <form onSubmit={handleSubmit}>
                            {/* Wrapping all controls in a fieldset disabled when locked */}
                            <fieldset disabled={locked} style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div className="form-group page-input">
                                    <label>Type</label>
                                    <div className="btn-group" role="group" aria-label="Type selection">
                                        {["title", "badge", "prefix"].map((typeOption) => (
                                            <button
                                                key={typeOption}
                                                type="button"
                                                className={`btn btn-outline-primary ${cosmetic.type === typeOption ? "active" : ""}`}
                                                onClick={() =>
                                                    setCosmetic({ ...cosmetic, type: typeOption })
                                                }
                                            >
                                                {typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group page-input">
                                    <label>Display</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cosmetic.display}
                                        onChange={(e) =>
                                            setCosmetic({ ...cosmetic, display: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group page-input">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cosmetic.description}
                                        onChange={(e) =>
                                            setCosmetic({ ...cosmetic, description: e.target.value })
                                        }
                                    />
                                </div>

                                <button type="submit" className="btn btn-success">
                                    Save Changes
                                </button>
                            </fieldset>
                        </form>
                    ) : (
                        <p>Cosmetic not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewCurrency;
