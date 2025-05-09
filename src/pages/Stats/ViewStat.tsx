import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/PageMetaBox';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import { fetchPageItem } from '../../helpers/FetchPageItem';
import Spinner from '../../components/Spinner';

const ViewStat = () => {
    const { authUser } = useAuth();
    const { id } = useParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stat, setStat] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        const fetchStatAndMeta = async () => {
            try {
                const data = await fetchPageItem('stats', `${id}`);
                setStat(data);

            } catch (err) {
                console.error(err);
                setError('Failed to fetch currency');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStatAndMeta();
        }
    }, [id]);

    const fetchLockedValue = async () => {
        try {

            const result = await fetchLocked('stat', `${id}`);
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

        const updatedStat = {
            id: stat.id,
            max: stat.max,
            capped: stat.capped,
            uuid: authUser?.uuid,
        };

        try {
            const res = await fetch(`http://localhost:3001/api/stats/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStat),
            });

            if (res.ok) {
                touchPageMeta('stat', `${id}`, `${authUser?.uuid}`);
                alert('Stat updated!');
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Error updating Stat');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update Stat');
        }
    };

    return (
        <div className={`page-container ${theme}`}>

            <div
                className="form-meta-container"
                style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
            >
                <PageMetaBox type="stat" id={id!} />
                <div style={{ flex: 3 }}>
                    {error && <div className="error-message">{error}</div>}
                    {locked && (
                        <div className="alert alert-warning page-input">
                            This Stat is locked and cannot be edited.
                        </div>
                    )}

                    {loading ? (
                        <Spinner type="Stat" />
                    ) : stat ? (
                        <form onSubmit={handleSubmit}>
                            {/* Wrapping all controls in a fieldset disabled when locked */}
                            <fieldset disabled={locked} style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div className="form-group page-input">
                                    <label>Maximum</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={stat.max}
                                        onChange={(e) =>
                                            setStat({ ...stat, max: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={stat.capped === 1}
                                        onChange={(e) =>
                                            setStat({
                                            ...stat,
                                            capped: e.target.checked ? 1 : 0,
                                            })
                                        }
                                    />
                                    <label className="form-check-label">
                                    Capped?
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-success">
                                    Save Changes
                                </button>
                            </fieldset>
                        </form>
                    ) : (
                        <p>Stat not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewStat;
