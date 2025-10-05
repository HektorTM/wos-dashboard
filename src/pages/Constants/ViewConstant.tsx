import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/metaboxes/PageMetaBox.tsx';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import { fetchPageItem } from '../../helpers/FetchPageItem';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';
import {Constant} from "../../types/Constant.tsx";

const ViewConstant = () => {
    const { authUser } = useAuth();
    const { id } = useParams();
    const [constant, setConstant] = useState<Constant>();
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);
    const APIBASE = `${import.meta.env.VITE_API_URL}/api/constants`

    useEffect(() =>{
        fetchConstant();
        fetchLockedValue();
    }, [id]);

    const fetchConstant = async () => {
        try {
            const data = await fetchPageItem('constants', `${id}`);
            setConstant({
                id: data?.id,
                value: data?.value,
            });
        } catch (err) {
            console.error(err);
            setError('Failed to fetch constant details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLockedValue = async () => {
        try {
            const result = await fetchLocked('constant', `${id}`);
            if (result == 1) {
                setLocked(true);
            } else {
                setLocked(false);
            }

        } catch (err) {
            console.error(err);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const body = { value: constant?.value };

        try {
            const res = await fetch(`${APIBASE}/${id}?uuid=${authUser?.uuid}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                await touchPageMeta('constant', `${id}`, `${authUser?.uuid}`);
                alert('Constant updated!');

            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Error updating Constant');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update Constant');
        }
    };


    return (
        <div className={`page-container ${theme}`}>
            <TitleComp title={`Constant | ${id}`}></TitleComp>
            <div
                className="form-meta-container"
                style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
            >
                <PageMetaBox type="constant" id={id!} deletePerm='portal.constants.delete' />
                <div style={{ flex: 3 }}>
                    {error && <div className="error-message">{error}</div>}
                    {locked && (
                        <div className="alert alert-warning page-input">
                            This Constant is locked and cannot be edited.
                        </div>
                    )}
                    {loading ? (
                        <Spinner type="Constant" />
                    ) : constant ? (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Identifier</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={constant.id}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Replace Value</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    value={constant.value}
                                    placeholder={`Text that is displayed instead of the {${id}} placeholder`}
                                    disabled={locked}
                                    onChange={(e) =>
                                        setConstant({
                                            ...constant,
                                            value: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <button type="submit" className="btn btn-success" disabled={locked}>
                                Save Changes
                            </button>
                        </form>
                    ) : (
                        <p>Constant not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewConstant;
