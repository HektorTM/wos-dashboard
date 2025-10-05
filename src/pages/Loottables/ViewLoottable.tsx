import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';
import { fetchLocked, touchPageMeta } from '../../helpers/PageMeta';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';
import {Dialog, DialogAnswer, DialogPage, PageLine} from '../../types/Dialog.tsx';
import DialogMetaBox from "../../components/metaboxes/DialogMetaBox.tsx";
import {Loottable, Loottableitem} from "../../types/Loottable.tsx";

const ViewDialog = () => {
    // state should be nullable
    const id = useParams().id;
    const { authUser } = useAuth();
    const { theme } = useTheme();
    const [lootable, setLootable] = useState<Loottable | null>(null);
    const [loottableItems, setLoottableItems] = useState<Loottableitem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newItem, setNewItem] = useState<Loottableitem>({ weight: 0, type: '', value: '', parameter: 0 });
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;

        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;

        await (async () => {
            try {
                setLoading(true);
                setError('');

                const [dRes, pRes, aRes] = await Promise.all([
                    fetch(base, {credentials: 'include'}),
                    fetch(`${base}/pages`, {credentials: 'include'}),
                    fetch(`${base}/answers`, {credentials: 'include'}),
                ]);

                if (!dRes.ok) throw new Error(`Dialog request failed (${dRes.status})`);
                if (!pRes.ok) throw new Error(`Pages request failed (${pRes.status})`);
                if (!aRes.ok) throw new Error(`Answers request failed (${aRes.status})`);

                const d: Dialog = await dRes.json();
                const rawPages: Array<Omit<DialogPage, 'lines'>> = await pRes.json();
                const a: DialogAnswer[] = await aRes.json();

                const pagesWithLines: DialogPage[] = await Promise.all(
                    rawPages.map(async (p) => {
                        const lRes = await fetch(`${base}/pages/${p.page_id}/lines`, {credentials: 'include'});
                        if (!lRes.ok) throw new Error(`Lines request failed for page ${p.page_id} (${lRes.status})`);
                        const lines: PageLine[] = await lRes.json();
                        return {...p, lines};
                    })
                );


                setLootable(d);
                setLoottableItems(pagesWithLines);
                setAnswers(a);
            } catch (e) {
                console.error(e);
                setError('Failed to fetch dialog details.');
                setLootable(null);
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
                const result = await fetchLocked('dialog', `${id}`);
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

    const handleModalSubmit = () => {
        if (modalMode === 'add') await handleAdd();
        if (modalMode === 'edit') await handleEdit();
    }

    const handleAdd = async () => {
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        const body = {
            line_text: newLine?.line_text,
        }
        try {
            const res = await fetch(`${base}/pages/${newLinePageId}/line`, {
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
            setNewItem({ page_id: 0, pre_action: '', post_action: '', lines: [] });
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to submit ${modalType} changes.`);
        }
    }

    const handleEdit = async () => {
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        const pageId = newLinePageId;
        const lineId = newLine?.line_id;
        const payload = {
            line_text: newLine?.line_text,
        }


        try {
            const res = await fetch(`${base}/page/${pageId}/lines/${lineId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Failed to edit line (${res.status})`);
            await fetchData();
            setShowModal(false);
            setNewLine({ line_id: 0, line_text: '' });
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to save line changes.`);
        }
    }

    const handleDelete = async (item: Loottableitem ) => {
        if (!window.confirm('Are you sure you want to delete this page?')) return;

        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        try {
            const res = await fetch(`${base}/page/${pageId}?uuid=${authUser?.uuid}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Failed to delete page (${res.status})`);
            setLoottableItems(prev => prev.filter(p => p.page_id !== pageId));
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError('Failed to delete page.');
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
                            value={newItem.post_action}
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
                            value={newItem.post_action}
                            onChange={(e) => setNewItem({...newItem, post_action: e.target.value})}
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
                                    <React.Fragment key={`lt-${item.page_id}`}>
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
                        </div>
                    ) : (
                        <p>No Pages configured</p>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className={`page-container ${theme}`}>
            <TitleComp title={`Dialog | ${id}`}/>
            <div className="content-wrapper" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div className="meta-box-wrapper" style={{width: '350px'}}>
                    {lootable ? <DialogMetaBox id={id!} dialog={lootable} /> : <div style={{ flex: 1 }}>{loading ? <Spinner type='Dialog' /> : null}</div>}
                </div>
                <div className="tabs-content-wrapper" style={{flex: 1}}>
                    {error && <div className="error-message">{error}</div>}
                    {locked && (
                        <div className="alert alert-warning">
                            This GUI is locked and cannot be edited.
                        </div>
                    )}
                    {renderTabContent()}
                </div>
            </div>
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`${modalMode ? modalMode : 'add'} ${modalType == undefined ? modalType : ''}`}
            >
                {renderModalForm()}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => {
                        setShowModal(false);
                        setNewItem({ page_id: 0, pre_action: '', post_action: '', lines: [] });
                        setNewAnswer({answer_id: 0, answer_text: '', answer_reply: '', answer_action: ''});
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

export default ViewDialog;