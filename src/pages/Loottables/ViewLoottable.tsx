import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import TitleComp from '../../components/TitleComponent';
import {Loottableitem, LTTypeList} from "../../types/Loottable.tsx";
import PageMetaBox from "../../components/metaboxes/PageMetaBox.tsx";
import Spinner from "../../components/Spinner.tsx";

const ViewLoottable = () => {
    // state should be nullable
    const id = useParams().id;
    const API = import.meta.env.VITE_API_URL;
    const base = `${API}/api/loottables/${id}`;
    const { authUser } = useAuth();
    const { theme } = useTheme();
    const [loottableItems, setLoottableItems] = useState<Loottableitem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newItem, setNewItem] = useState<Loottableitem>({item_id: 0, weight: 0, type: '', value: '', parameter: 0 });
    const [locked, setLocked] = useState(false);
    const resetNewItem = () => {
        setNewItem({ item_id: 0, weight: 0, type: '', value: '', parameter: 0 });
    }


    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        await (async () => {
            try {
                setLoading(true);
                setError('');
                const items = await fetch(`${base}/items`, {method: 'GET', credentials: 'include'});
                const data: Loottableitem[] = await items.json();
                setLoottableItems(data);
            } catch (e) {
                console.error(e);
                setError('Failed to fetch loottable details.');
                setLoottableItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const result = await fetchLocked('loottable', `${id}`);
                setLocked(result === 1);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [id]);

    const openModal = (mode: 'add' | 'edit', item?: Loottableitem) => {
        if (item) setNewItem(item);
        setModalMode(mode);
        setShowModal(true);
    }

    const handleModalSubmit = async () => {
        if (modalMode === 'add') await handleAdd();
        if (modalMode === 'edit') await handleEdit();
    }

    const handleAdd = async () => {
        const body = {
            weight: newItem.weight,
            type: newItem.type,
            value: newItem.value,
            parameter: newItem.parameter ?? null,
        }
        try {
            const res = await fetch(`${base}/item`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to add line (${res.status}) - ${text}`);
            }
            await fetchData();
            setShowModal(false);
            resetNewItem();
            await touchPageMeta('loottable', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to submit Loottable changes.`);
        }
    }

    const handleEdit = async () => {
        const itemId = newItem?.item_id;
        const payload = {
            weight: newItem.weight,
            type: newItem.type,
            value: newItem.value,
            parameter: newItem.parameter ?? null,
        }


        try {
            const res = await fetch(`${base}/item/${itemId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Failed to edit loottable item (${res.status})`);
            await fetchData();
            setShowModal(false);
            resetNewItem();
            await touchPageMeta('loottable', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to save item changes.`);
        }
    }

    const handleDelete = async (item: Loottableitem ) => {
        if (!window.confirm('Are you sure you want to delete this Item?')) return;

        try {
            const res = await fetch(`${base}/item/${item.item_id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Failed to delete loottable item (${res.status})`);
            await fetchData();
            await touchPageMeta('loottable', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError('Failed to delete loottable item.');
        }
    }

    const renderModalForm = () => {
        return (
            <div className="form-group">
                <label>Type</label>
                <input
                    disabled={locked}
                    type="text"
                    placeholder="Select Type"
                    list="lt_types"
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                    className="form-control"
                />
                <LTTypeList></LTTypeList>
                <label>Weight</label>
                <input
                    disabled={locked}
                    placeholder="Interaction Identifier"
                    type="number"
                    value={newItem.weight}
                    onChange={(e) => setNewItem({...newItem, weight: parseInt(e.target.value)})}
                    className="form-control"
                />

                {newItem.type != '' && (
                    <>
                        <label>
                            {newItem.type === 'interaction' && 'Interaction Identifier'}
                            {newItem.type === 'gui' && 'GUI Identifier'}
                            {newItem.type === 'dialog' && 'Dialog Identifier'}
                            {newItem.type === 'command' && 'Command'}
                            {newItem.type === 'citem' && 'Citem Identifier'}
                        </label>
                        <input
                            disabled={locked}
                            placeholder="Value"
                            type="text"
                            value={newItem.value}
                            onChange={(e) => setNewItem({...newItem, value: e.target.value})}
                            className="form-control"
                        />
                    </>
                )}
                {newItem.type === 'citem' && (
                    <>
                        <label>Amount</label>
                        <input
                            disabled={locked}
                            placeholder="Citem amount to give"
                            type="text"
                            value={newItem.parameter}
                            onChange={(e) => setNewItem({...newItem, parameter: parseInt(e.target.value)})}
                            className="form-control"
                        />
                    </>
                )}
            </div>
        )
    }

    const renderTabHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Loottable Configuration</h3>
            <button
                className="create-button"
                disabled={locked}
                onClick={() => openModal('add')}
            >
                Add Item
            </button>
        </div>
    );



    const renderActionButtons = (item: Loottableitem) => {
        return (
            <div style={{display: 'flex', gap: '0.5rem' }}>
                <p className="btn btn-sm btn-primary" onClick={() => openModal('edit', item)}>
                    Edit
                </p>
                <p className="btn btn-sm btn-danger" onClick={!locked ? () => handleDelete(item) : undefined}> Delete </p>
            </div>
        );
    };

    const renderTabContent = () => {
        if (!loottableItems) return null;
        return (
            <>
                <div className="tab-content">

                    {renderTabHeader()}
                    {loottableItems.length > 0 ? (
                        <div className="page-table-container">
                            {!loading ? (
                            <table className="page-table" style={{zIndex: '50', overflow: 'auto'}}>
                                <thead>
                                <tr>
                                    <th>Weight</th>
                                    <th>Type</th>
                                    <th>value</th>
                                    <th>parameter</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {loottableItems.map((item) => (
                                    // group each page as 1-2 rows
                                    <React.Fragment key={`lt-${item.item_id}`}>
                                        <tr style={{ border: 'none' }}>
                                            <td>{item.type}</td>
                                            <td>{item.weight}</td>
                                            <td>{item.value}</td>
                                            <td>{item.parameter}</td>
                                            <td>{renderActionButtons(item)}</td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>

                        ) : (
                            <div style={{ flex: 1 }}>{loading ? <Spinner type='Dialog' /> : null}</div>
                        )}
                    </div>
                    ) : (
                        <p>No Items configured</p>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className={`page-container ${theme}`}>
            <TitleComp title={`Loot table | ${id}`}/>
            <div className="content-wrapper" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div className="meta-box-wrapper" style={{width: '350px'}}>
                    <PageMetaBox id={id!} type="loottable" />
                </div>
                <div className="tabs-content-wrapper" style={{flex: 1}}>
                    {error && <div className="error-message">{error}</div>}
                    {locked && (
                        <div className="alert alert-warning">
                            This Loot table is locked and cannot be edited.
                        </div>
                    )}
                    {renderTabContent()}
                </div>
            </div>
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`${modalMode ? modalMode : 'add'} Loottable Item`}
            >
                {renderModalForm()}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => {
                        setShowModal(false);
                        setNewItem({ item_id: 0, weight: 0, type: '', value: '', parameter: 0 });
                    } }>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleModalSubmit}
                        disabled={locked}
                    >
                        {modalMode === 'add' ? 'Create' : 'Save'}
                    </button>
                </div>
            </Modal>
        </div>


    );
}

export default ViewLoottable;