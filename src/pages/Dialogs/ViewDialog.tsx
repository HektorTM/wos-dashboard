import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TitleComp from '../../components/TitleComponent';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import DialogMetaBox from '../../components/metaboxes/DialogMetaBox';
import { DialogPage, PageLine, DialogAnswer } from '../../types/Dialog';
import { useDialog } from '../../hooks/useDialog';

const ViewDialog = () => {
    const id = useParams().id;
    const { theme } = useTheme();
    const {
        dialog,
        pages,
        answers,
        loading,
        locked,
        addPage,
        editPage,
        deletePage,
        addLine,
        editLine,
        deleteLine,
        addAnswer,
        editAnswer,
        deleteAnswer,
    } = useDialog(id);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [modalType, setModalType] = useState<'page' | 'line' | 'answer'>('page');
    const [newPage, setNewPage] = useState<DialogPage>({ page_id: 0, pre_action: '', post_action: '', lines: [] });
    const [newLine, setNewLine] = useState<PageLine>({ line_id: 0, line_text: '' });
    const [newAnswer, setNewAnswer] = useState<DialogAnswer>({ answer_id: 0, answer_text: '', answer_action: '' });
    const [newLinePageId, setNewLinePageId] = useState<number | null>(null);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggle = (pageId: number) =>
        setExpanded((prev) => ({ ...prev, [pageId]: !prev[pageId] }));

    const openModal = (type: 'page' | 'line' | 'answer', mode: 'add' | 'edit') => {
        setModalType(type);
        setModalMode(mode);
        setShowModal(true);
    };

    const handleModalSubmit = async () => {
        switch (modalMode) {
            case 'add':
                if (modalType === 'page') await addPage(newPage);
                if (modalType === 'line' && newLinePageId) await addLine(newLinePageId, newLine);
                if (modalType === 'answer') await addAnswer(newAnswer);
                break;
            case 'edit':
                if (modalType === 'page') await editPage(newPage);
                if (modalType === 'line' && newLinePageId) await editLine(newLinePageId, newLine);
                if (modalType === 'answer') await editAnswer(newAnswer);
                break;
            default:
                break;
        }
        setShowModal(false);
    };

    const openPageEditModal = (page: DialogPage) => {
        setNewPage(page);
        openModal('page', 'edit');
    };
    const openLineAddModal = (page: DialogPage) => {
        setNewLinePageId(page.page_id);
        setNewLine({ line_id: 0, line_text: '' });
        openModal('line', 'add');
    };
    const openLineEditModal = (page: DialogPage, line: PageLine) => {
        setNewLinePageId(page.page_id);
        setNewLine(line);
        openModal('line', 'edit');
    };
    const openAnswerEditModal = (answer: DialogAnswer) => {
        setNewAnswer(answer);
        openModal('answer', 'edit');
    };

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
                            onChange={(e) => setNewPage({ ...newPage, pre_action: e.target.value })}
                            className="form-control"
                        />
                        <label>Post Action</label>
                        <input
                            disabled={locked}
                            type="text"
                            placeholder="Interaction Identifier"
                            value={newPage.post_action}
                            onChange={(e) => setNewPage({ ...newPage, post_action: e.target.value })}
                            className="form-control"
                        />
                    </div>
                );
            case 'line':
                return (
                    <div className="form-group">
                        <label>Line Text</label>
                        <input
                            disabled={locked}
                            type="text"
                            placeholder="Line text (~50 chars)"
                            value={newLine.line_text}
                            onChange={(e) => setNewLine({ ...newLine, line_text: e.target.value })}
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
                            placeholder="Answer text (~30 chars)"
                            value={newAnswer.answer_text}
                            onChange={(e) => setNewAnswer({ ...newAnswer, answer_text: e.target.value })}
                            className="form-control"
                        />
                        <label>Answer Action</label>
                        <input
                            disabled={locked}
                            type="text"
                            placeholder="Action triggered"
                            value={newAnswer.answer_action}
                            onChange={(e) => setNewAnswer({ ...newAnswer, answer_action: e.target.value })}
                            className="form-control"
                        />
                    </div>
                );
        }
    };

    if (loading) return <Spinner type="Dialog" />;

    return (
        <div className={`page-container ${theme}`}>
            <TitleComp title={`Dialog | ${id}`} />
            <div className="content-wrapper" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div className="meta-box-wrapper" style={{ width: '350px' }}>
                    {dialog && <DialogMetaBox id={id!} dialog={dialog} />}
                </div>
                <div className="tabs-content-wrapper" style={{ flex: 1 }}>
                    {locked && <div className="alert alert-warning">This Dialog is locked and cannot be edited.</div>}

                    {/* Page Table */}
                    <div className="tab-content">
                        <div className="header">
                            <h3>Page Configuration</h3>
                            <button className="create-button" disabled={locked} onClick={() => openModal('page', 'add')}>
                                Add Page
                            </button>
                        </div>
                        <table className="page-table">
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
                                <React.Fragment key={page.page_id}>
                                    <tr>
                                        <td>{page.page_id}</td>
                                        <td>{page.pre_action}</td>
                                        <td>{page.post_action}</td>
                                        <td style={{display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-sm btn-primary" onClick={() => openPageEditModal(page)}>Edit</button>
                                            <button className="btn btn-sm btn-success" disabled={locked} onClick={() => deletePage(page.page_id)}>Delete</button>
                                            <button className="btn btn-sm btn-danger" disabled={locked} onClick={() => openLineAddModal(page)}>Add Line</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}>
                                            <button onClick={() => toggle(page.page_id)}>
                                                {expanded[page.page_id] ? 'Hide lines' : `Show lines (${page.lines.length ?? 0})`}
                                            </button>
                                            {expanded[page.page_id] && (
                                                <table>
                                                    <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Text</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {page.lines.map((line) => (
                                                        <tr key={line.line_id}>
                                                            <td>{line.line_id}</td>
                                                            <td>{line.line_text}</td>
                                                            <td style={{display: 'flex', gap: '0.5rem' }}>
                                                                <button className="btn btn-sm btn-primary" onClick={() => openLineEditModal(page, line)}>Edit</button>
                                                                <button className="btn btn-sm btn-danger" disabled={locked} onClick={() => deleteLine(page.page_id, line.line_id)}>Delete</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Answer Table */}
                    <div className="tab-content" style={{ marginTop: '2rem' }}>
                        <div className="header">
                            <h3>Answer Configuration</h3>
                            {answers.length < 3 && (
                                <button className="create-button" disabled={locked} onClick={() => openModal('answer', 'add')}>
                                    Add Answer
                                </button>
                            )}
                        </div>
                        <table className="page-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Text</th>
                                <th>Action</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {answers.map((a) => (
                                <tr key={a.answer_id}>
                                    <td>{a.answer_id}</td>
                                    <td>{a.answer_text}</td>
                                    <td>{a.answer_action}</td>
                                    <td style={{display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-sm btn-primary" onClick={() => openAnswerEditModal(a)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" disabled={locked} onClick={() => deleteAnswer(a.answer_id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${modalMode} ${modalType}`}>
                {renderModalForm()}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" disabled={locked} onClick={handleModalSubmit}>
                        {modalMode === 'add' ? 'Create' : 'Save'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ViewDialog;
