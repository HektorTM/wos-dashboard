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

const ViewDialog = () => {
    // state should be nullable
    const id = useParams().id;
    const { authUser } = useAuth();
    const { theme } = useTheme();
    const [dialog, setDialog] = useState<Dialog | null>(null);
    const [pages, setPages] = useState<DialogPage[]>([]);
    const [answers, setAnswers] = useState<DialogAnswer[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [modalType, setModalType] = useState<'page' | 'line' | 'answer'>('page');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newPage, setNewPage] = useState<DialogPage>({ page_id: 0, pre_action: '', post_action: '', lines: [] });
    const [newLine, setNewLine] = useState<PageLine>({ line_id: 0, line_text: '' });
    const [newAnswer, setNewAnswer] = useState<DialogAnswer>({answer_id: 0, answer_text: '', answer_reply: '', answer_action: ''});
    const [newLinePageId, setNewLinePageId] = useState<number | null>(null);
    const [locked, setLocked] = useState(false);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const toggle = (pageId: number) =>
        setExpanded(prev => ({ ...prev, [pageId]: !prev[pageId] }));

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


                setDialog(d);
                setPages(pagesWithLines);
                setAnswers(a);
            } catch (e) {
                console.error(e);
                setError('Failed to fetch dialog details.');
                setDialog(null);
                setPages([]);
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

    const openModal = (type: 'page' | 'line' | 'answer', mode: 'add' | 'edit') => {
        setModalType(type);
        setModalMode(mode);
        setShowModal(true);
    }

    const handleModalSubmit = async () => {
        switch (modalMode) {
            case 'add':
                if (modalType === 'page') await handlePageAdd();
                if (modalType === 'line') await handleLineAdd();
                if (modalType === 'answer') await handleAnswerAdd();
                break;
            case 'edit':
                if (modalType === 'page') await handlePageEdit();
                if (modalType === 'line') await handleLineEdit();
                if (modalType === 'answer') await handleAnswerEdit();
                break;
            default:
                break;
        }
    }


    const handlePageAdd = async () => {
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        const body = {
            pre_action: newPage?.pre_action,
            post_action: newPage?.post_action,
        }
        try {
            const res = await fetch(`${base}/page`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error(`Failed to add page (${res.status})`);
            const created = await res.json();
            setPages(prev => [...prev, {...created, lines: []}]);
            setShowModal(false);
            setNewPage({ page_id: 0, pre_action: '', post_action: '', lines: [] });
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to submit ${modalType} changes.`);
        }
    }

    const handleLineAdd = async () => {
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
            setNewPage({ page_id: 0, pre_action: '', post_action: '', lines: [] });
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to submit ${modalType} changes.`);
        }
    }
    const handleAnswerAdd = async () => {
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        const body = {
            answer_text: newAnswer?.answer_text,
            answer_reply: newAnswer?.answer_reply,
            answer_action: newAnswer?.answer_action,
        }
        try {
            const res = await fetch(`${base}/answer`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to create Answer (${res.status}) - ${text}`);
            }
            await fetchData();
            setShowModal(false);
            setNewAnswer({ answer_id: 0, answer_text: '', answer_reply: '', answer_action: '' });
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to submit ${modalType} changes.`);
        }
    }

    const handlePageEdit = async () => {
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        const pageId = newPage?.page_id;
        const payload = {
            pre_action: newPage?.pre_action,
            post_action: newPage?.post_action,
        }

        const prevPages = pages;
        setPages(curr => curr.map(p => (
            p.page_id === pageId ? { ...p, ...payload } : p
        )));

        try {
            const res = await fetch(`${base}/page/${pageId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Failed to edit page (${res.status})`);
            await fetchData();
            setShowModal(false);
            setNewPage({ page_id: 0, pre_action: '', post_action: '', lines: [] });
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setPages(prevPages);
            setError(`Failed to save page changes.`);
        }
    }
    const handleLineEdit = async () => {
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
    const handleAnswerEdit = async () => {
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        const answerId = newAnswer?.answer_id;
        const payload = {
            answer_text: newAnswer?.answer_text,
            answer_reply: newAnswer?.answer_reply,
            answer_action: newAnswer?.answer_action,
        }


        try {
            const res = await fetch(`${base}/answer/${answerId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Failed to edit Answer (${res.status})`);
            await fetchData();
            setShowModal(false);
            setNewAnswer({answer_id: 0, answer_text: '', answer_reply: '', answer_action: ''});
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError(`Failed to save Answer changes.`);
        }
    }

    const handleDelete = async (pageId: number ) => {
        if (!window.confirm('Are you sure you want to delete this page?')) return;

        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        try {
            const res = await fetch(`${base}/page/${pageId}?uuid=${authUser?.uuid}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Failed to delete page (${res.status})`);
            setPages(prev => prev.filter(p => p.page_id !== pageId));
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError('Failed to delete page.');
        }
    }

    const handleLineDelete = async (pageId: number, lineId: number ) => {
        if (!window.confirm('Are you sure you want to delete this line?')) return;
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        try {
            const res = await fetch(`${base}/page/${pageId}/line/${lineId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Failed to delete line (${res.status})`);
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError('Failed to delete line.');
        }
    }

    const handleAnswerDelete = async (answerId: number ) => {
        if (!window.confirm('Are you sure you want to delete this line?')) return;
        const API = import.meta.env.VITE_API_URL;
        const base = `${API}/api/dialogs/${id}`;
        try {
            const res = await fetch(`${base}/answer/${answerId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Failed to delete answer (${res.status})`);
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (err) {
            console.error(err);
            setError('Failed to delete answer.');
        }
    }

    const openPageEditModal = (page: DialogPage) => {
        setNewPage(page);
        openModal('page', 'edit');
    }
    const openLineAddModal = (page: DialogPage) => {
        setNewLinePageId(page.page_id);
        setNewLine({ line_id: 0, line_text: '' });
        openModal('line', 'add');
    }
    const openLineEditModal = (page: DialogPage, line: PageLine) => {
        setNewLinePageId(page.page_id);
        setNewLine({ line_id: line.line_id, line_text: line.line_text });
        openModal('line', 'edit');
    }
    const openAnswerEditModal = (answer: DialogAnswer) => {
        setNewAnswer({ answer_id: answer.answer_id, answer_text: answer.answer_text, answer_reply: answer.answer_reply, answer_action: answer.answer_action });
        openModal('answer', 'edit');
    }

    const renderModalForm = () => {
        switch (modalType) {
            case 'page':
            return (
                <div className="form-group">
                    <label>Pre Action</label>
                    <input
                        disabled={locked}
                        type="text"
                        placeholder="Interaction Identifier"
                        value={newPage.pre_action}
                        onChange={(e) => setNewPage({...newPage, pre_action: e.target.value})}
                        className="form-control"
                    />
                    <label>Post Action</label>
                    <input
                        disabled={locked}
                        placeholder="Interaction Identifier"
                        type="text"
                        value={newPage.post_action}
                        onChange={(e) => setNewPage({...newPage, post_action: e.target.value})}
                        className="form-control"
                    />
                </div>
            )
            case 'line':
                return (
                    <div className="form-group">
                        <label>Line Text</label>
                        <input
                            disabled={locked}
                            type="text"
                            maxLength={31}
                            placeholder="Text to display (31 Characters max)"
                            value={newLine.line_text}
                            onChange={(e) => setNewLine({...newLine, line_text: e.target.value})}
                            className="form-control"
                        />
                    </div>
                );
            case 'answer':
                return (
                    <div className="form-group">
                        <label>Answer Text</label>
                        <input
                            disabled={locked}
                            type="text"
                            required
                            maxLength={19}
                            placeholder="Text to display (19 Characters max)"
                            value={newAnswer.answer_text}
                            onChange={(e) => setNewAnswer({...newAnswer, answer_text: e.target.value})}
                            className="form-control" />
                        <label>Answer Reply</label>
                        <input
                            disabled={locked}
                            type="text"
                            placeholder="Text sent in chat"
                            value={newAnswer.answer_reply}
                            onChange={(e) => setNewAnswer({...newAnswer, answer_reply: e.target.value})}
                            className="form-control"
                        />
                        <label>Answer Action</label>
                        <input
                            disabled={locked}
                            type="text"
                            placeholder="Interaction played when selected"
                            value={newAnswer.answer_action}
                            onChange={(e) => setNewAnswer({...newAnswer, answer_action: e.target.value})}
                            className="form-control"
                        />
                    </div>

                );
        }
    }

    const renderTabHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Page Configuration</h3>
            <button
                className="create-button"
                disabled={locked}
                onClick={() => openModal('page', 'add')}
            >
                Add Page
            </button>
        </div>
    );

    const renderAnswerTabHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',  marginBottom: '1rem'}}>
            <h3>Answer Configuration</h3>
            {answers.length < 3 && (
                <button
                    className="create-button"
                    disabled={locked}
                    onClick={() => openModal('answer', 'add')}
                >
                    Add Answer
                </button>
            )}
        </div>
    );


    const renderPageActionButtons = (item: DialogPage) => {
        let itemId: string | number = '';
        itemId = item.page_id;


        return (
            <div style={{display: 'flex', gap: '0.5rem' }}>
                <p className="btn btn-sm btn-primary" onClick={() => openPageEditModal(item)}>
                    Edit
                </p>
                {item.lines.length != 5 && (
                    <p className="btn btn-sm btn-success" onClick={() => openLineAddModal(item)}> Add Line </p>
                )}

                <p className="btn btn-sm btn-danger" onClick={!locked ? () => handleDelete(itemId) : undefined}> Delete </p>
                <p>
                </p>
            </div>
        );
    };
    const renderLineActionButtons = (page: DialogPage, item: PageLine) => {
        let itemId: string | number = '';
        let pageId: string | number = '';
        pageId = page.page_id;
        itemId = item.line_id;


        return (
            <div style={{display: 'flex', gap: '0.5rem' }}>
                <p className="btn btn-sm btn-primary" onClick={() => openLineEditModal(page, item)}>
                    Edit
                </p>

                <p className="btn btn-sm btn-danger" onClick={!locked ? () => handleLineDelete(pageId, itemId) : undefined}> Delete </p>
            </div>
        );
    };
    const renderAnswerActionButtons = (item: DialogAnswer) => {
        let itemId: string | number = '';
        itemId = item.answer_id;


        return (
            <div style={{display: 'flex', gap: '0.5rem' }}>
                <p className="btn btn-sm btn-primary" onClick={() => openAnswerEditModal(item)}>
                    Edit
                </p>

                <p className="btn btn-sm btn-danger" onClick={!locked ? () => handleAnswerDelete(itemId) : () => console.log("cannot delete")}> Delete </p>
            </div>
        );
    };



    const renderTabContent = () => {
        if (!pages) return null;
        return (
            <>
                <div className="tab-content">

                    {renderTabHeader()}
                    {pages.length > 0 ? (
                        <div className="page-table-container">
                            <table className="page-table" style={{zIndex: '50', overflow: 'auto'}}>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Pre Action</th>
                                    <th>Post Action</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {pages.map((page) => (
                                    // group each page as 1-2 rows
                                    <React.Fragment key={`page-${page.page_id}`}>
                                        <tr style={{ border: 'none' }}>
                                            <td>{page.page_id}</td>
                                            <td>{page.pre_action}</td>
                                            <td>{page.post_action}</td>
                                            <td>{renderPageActionButtons(page)}</td>
                                        </tr>
                                        <tr
                                            className="expander-toggle"
                                            onClick={() => toggle(page.page_id)}
                                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(page.page_id)}
                                            tabIndex={0}
                                            role="button"
                                            style={{padding: '2px 6px;'}}
                                            aria-expanded={!!expanded[page.page_id]}
                                            aria-controls={`lines-${page.page_id}`}
                                        >
                                            {/* colspan must match your header count (4 here) */}
                                            <td colSpan={4} style={{borderBottom: '2px solid var(--border-color)'}}>
                                                {expanded[page.page_id]
                                                    ? 'hide lines'
                                                    : `show lines (${page.lines?.length ?? 0})`}
                                            </td>
                                        </tr>

                                        {expanded[page.page_id] && (
                                            <tr className="details-row">
                                                {/* colspan must match total header columns */}
                                                <td colSpan={5} id={`lines-${page.page_id}`}>
                                                    {page.lines.length === 0 ? (
                                                        <div className="empty-lines">No lines on this page.</div>
                                                    ) : (
                                                        <table style={{width: '100%', borderCollapse: 'collapse', zIndex: '10'}}>
                                                            <thead>
                                                            <tr>
                                                                <th style={{width: 80}}>Line ID</th>
                                                                <th>Text</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {page.lines.map((line) => (
                                                                <tr  key={`line-${page.page_id}-${line.line_id}`}>
                                                                    <td>{line.line_id}</td>
                                                                    <td>{line.line_text}</td>
                                                                    <td>{renderLineActionButtons(page, line)}</td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No Pages configured</p>
                    )}
                </div>
                <div className="tab-content" style={{marginTop: '1rem'}}>
                    {renderAnswerTabHeader()}
                    {answers.length > 0 ? (
                        <div className="page-table-container">
                            <table className="page-table" style={{zIndex: '50', overflow: 'auto'}}>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Text</th>
                                    <th>Reply Text</th>
                                    <th>Answer Actions</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {answers.map((answer) => (
                                    // group each page as 1-2 rows
                                    <React.Fragment key={`answer-${answer.answer_id}`}>
                                        <tr style={{ border: 'none' }}>
                                            <td>{answer.answer_id}</td>
                                            <td>{answer.answer_text}</td>
                                            <td>{answer.answer_reply}</td>
                                            <td>{answer.answer_action}</td>
                                            <td>{renderAnswerActionButtons(answer)}</td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No Answers configured</p>
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
                {dialog ? <DialogMetaBox id={id!} dialog={dialog} /> : <div style={{ flex: 1 }}>{loading ? <Spinner type='Dialog' /> : null}</div>}
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
                        setNewPage({ page_id: 0, pre_action: '', post_action: '', lines: [] });
                        setNewAnswer({answer_id: 0, answer_text: '', answer_reply: '', answer_action: ''});
                    } }>Cancel</button>
                    <button className="btn btn-primary" onClick={handleModalSubmit} disabled={locked}>{modalMode === 'add' ? 'Create' : 'Save'}</button>
                </div>
            </Modal>
        </div>


    );
}

export default ViewDialog;