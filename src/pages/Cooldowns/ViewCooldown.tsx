import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/metaboxes/PageMetaBox.tsx';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import { fetchPageItem } from '../../helpers/FetchPageItem';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';

const ViewCooldown = () => {
    const { authUser } = useAuth();
    const { id } = useParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cooldown, setCooldown] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        const fetchCooldownAndMeta = async () => {
            try {
                const data = await fetchPageItem('cooldowns', `${id}`);
                setCooldown(data);

            } catch (err) {
                console.error(err);
                setError('Failed to fetch cooldown');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCooldownAndMeta();
        }
    }, [id]);

    const fetchLockedValue = async () => {
        try {

            const result = await fetchLocked('cooldown', `${id}`);
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

        const updatedCooldown = {
            id: cooldown.id,
            duration: cooldown.duration,
            start_interaction: cooldown.start_interaction,
            end_interaction: cooldown.end_interaction,
            uuid: authUser?.uuid,
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cooldowns/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCooldown),
            });

            if (res.ok) {
                touchPageMeta('cooldown', `${id}`, `${authUser?.uuid}`);
                alert('Cooldown updated!');
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Error updating Cooldown');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update Cooldown');
        }
    };

    return (
        <div className={`page-container ${theme}`}>
            <TitleComp title={`Cooldown | ${id}`}></TitleComp>
            <div
                className="form-meta-container"
                style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
            >
                <PageMetaBox type="cooldown" id={id!} />
                <div style={{ flex: 3 }}>
                    {error && <div className="error-message">{error}</div>}
                    {locked && (
                        <div className="alert alert-warning page-input">
                            This Cooldown is locked and cannot be edited.
                        </div>
                    )}

                    {loading ? (
                        <Spinner type="Cooldown" />
                    ) : cooldown ? (
                        <form onSubmit={handleSubmit}>
                            {/* Wrapping all controls in a fieldset disabled when locked */}
                            <fieldset disabled={locked} style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div className="form-group page-input">
                                    <label>Duration</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={cooldown.duration}
                                        onChange={(e) =>
                                            setCooldown({ ...cooldown, duration: parseInt(e.target.value)})
                                        }
                                    />
                                </div>

                                <div className="form-group page-input">
                                    <label>Start Interaction</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cooldown.start_interaction || ''}
                                        onChange={(e) =>
                                            setCooldown({ ...cooldown, start_interaction: e.target.value || null})
                                        }
                                    />
                                </div>
                                <div className="form-group page-input">
                                    <label>End Interaction</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cooldown.end_interaction || ''}
                                        onChange={(e) =>
                                            setCooldown({ ...cooldown, end_interaction: e.target.value || null})
                                        }
                                    />
                                </div>

                                <button type="submit" className="btn btn-success">
                                    Save Changes
                                </button>
                            </fieldset>
                        </form>
                    ) : (
                        <p>Cooldown not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewCooldown;
