import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { getStaffUserByUUID, parseTime, toUpperCase } from '../../utils/parser.tsx';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../utils/usePermission.ts';
import Modal from '../Modal.tsx';
import { Dialog} from '../../types/Dialog.tsx'

interface DialogMetaBoxProps {
  id: string;
  dialog: Dialog;
}

interface PageData {
  created_by?: string;
  edited_by?: string;
  locked?: boolean;
  created_at?: string;
  edited_at?: string;
}



const DialogMetaBox: React.FC<DialogMetaBoxProps> = ({ id, dialog }) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const defaultColors = {
    char_name_color: '#4f4a3e',
    text_color: '#4f4a3e',
    background_color: '#f8ffe0',
    answer_background_color: '#f8ffe0',
    fog_color: '#000000',
    arrow_color: '#cdff29',
    selected_color: '#4f4a3e',
  };

  function normalizeDialog(input: any): Dialog | null {
    const raw = Array.isArray(input) ? input[0] : input; // support array or object
    if (!raw) return null;

    return {
      dialog_id: raw.dialog_id ?? '',
      char_name: raw.char_name ?? '',

      // coalesce nulls to defaults so <input type="color"> always has a valid value
      char_name_color: raw.char_name_color ?? defaultColors.char_name_color,
      text_color: raw.text_color ?? defaultColors.text_color,
      background_color: raw.background_color ?? defaultColors.background_color,
      answer_background_color: raw.answer_background_color ?? defaultColors.answer_background_color,
      fog_color: raw.fog_color ?? defaultColors.fog_color,
      arrow_color: raw.arrow_color ?? defaultColors.arrow_color,
      selected_color: raw.selected_color ?? defaultColors.selected_color,
    };
  }

  const normalized = normalizeDialog(dialog) ?? {
    dialog_id: '',
    char_name: '',
    ...defaultColors,
  };
  const [currentDialog, setCurrentDialog] = useState<Dialog>(normalized);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [editorName, setEditorName] = useState<string | null>(null);
  const { authUser } = useAuth();
  const { hasPermission } = usePermission();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [showDialogModal, setShowDialogModal] = useState(false);
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [dialogForm, setDialogForm] = useState({
    char_name: normalized.char_name,
    char_name_color: normalized.char_name_color!,
    text_color: normalized.text_color!,
    background_color: normalized.background_color!,
    answer_background_color: normalized.answer_background_color!,
    fog_color: normalized.fog_color!,
    arrow_color: normalized.arrow_color!,
    selected_color: normalized.selected_color!,
  });
  const [isSavingDialog, setIsSavingDialog] = useState(false);

  useEffect(() => {
    const n = normalizeDialog(dialog);
    if (!n) return; // nothing to sync yet

    setCurrentDialog(n); // OK if async; we don't read it right away
    setDialogForm({
      char_name: n.char_name ?? '',
      char_name_color: n.char_name_color!,
      text_color: n.text_color!,
      background_color: n.background_color!,
      answer_background_color: n.answer_background_color!,
      fog_color: n.fog_color!,
      arrow_color: n.arrow_color!,
      selected_color: n.selected_color!,
    });
  }, [id, JSON.stringify(dialog)]);

  const openRequestModal = (rType:string) => {
    setRequestType(rType);
    setShowRequestModal(true)
  };
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestDescription('');
    setSubmitError('');
  };

  const openDialogModal = () => setShowDialogModal(true);
  const closeDialogModal = () => setShowDialogModal(false);

  const handleDialogSubmit = async () => {
    setIsSavingDialog(true);
    setSubmitError('');

    // optional: convert empty strings to null for colors
    const toNull = (v: string) => (v === '' ? null : v);

    const payload = {
      char_name: dialogForm.char_name,
      char_name_color: toNull(dialogForm.char_name_color),
      text_color: toNull(dialogForm.text_color),
      background_color: toNull(dialogForm.background_color),
      answer_background_color: toNull(dialogForm.answer_background_color),
      fog_color: toNull(dialogForm.fog_color),
      arrow_color: toNull(dialogForm.arrow_color),
      selected_color: toNull(dialogForm.selected_color),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dialogs/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }

      // some APIs return 204 No Content on PUT
      const hasBody = res.status !== 204;
      if (hasBody) {
        const updated = (await res.json()) as Dialog; // or normalize if casing varies
        setCurrentDialog(updated);
        setDialogForm({
          char_name: updated.char_name ?? '',
          char_name_color: updated.char_name_color ?? dialogForm.char_name_color,
          text_color: updated.text_color ?? dialogForm.text_color,
          background_color: updated.background_color ?? dialogForm.background_color,
          answer_background_color: updated.answer_background_color ?? dialogForm.answer_background_color,
          fog_color: updated.fog_color ?? dialogForm.fog_color,
          arrow_color: updated.arrow_color ?? dialogForm.arrow_color,
          selected_color: updated.selected_color ?? dialogForm.selected_color,
        });
      }

      alert('Dialog settings updated successfully!');
      closeDialogModal();
    } catch (e: any) {
      console.error('Dialog update error:', e);
      setSubmitError(e.message || 'Failed to update Dialog settings');
    } finally {
      setIsSavingDialog(false);
    }
  };


  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this Dialog?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dialogs/${id}?uuid=${authUser?.uuid}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Delete failed:', errorData);
        alert(`Failed to delete Dialog: ${errorData.error}`);
        return;
      }

      alert('Dialog deleted successfully!');
      backToList();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete Dialog');
    }
  }

  const handleRequestSubmit = async () => {
    if (!requestDescription.trim()) {
      setSubmitError('Please enter a description');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'UNLOCK',
          type: 'dialog',
          id,
          uuid: authUser?.uuid,
          description: requestDescription
        })
      });

      if (!res.ok) throw new Error('Failed to submit request');

      await res.json();
      alert('Unlock request submitted successfully!');
      closeRequestModal();
    } catch (err) {
      console.error('Request submission error:', err);
      setSubmitError('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToList = () => {
    navigate('/dialogs');
  };

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/dialog/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load metadata');
      const result = await res.json();
      setPageData(result);

      if (result.created_by) {
        const name = await parseUUIDToUsername(result.created_by);
        setCreatorName(name);
      }

      if (result.edited_by) {
        const name = await parseUUIDToUsername(result.edited_by);
        setEditorName(name);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading metadata');
    } finally {
      setLoading(false);
    }
  };

  const parseUUIDToUsername = async (uuid: string): Promise<string | null> => {
    try {
      const response = await getStaffUserByUUID(uuid);
      return response?.username || null;
    } catch (error) {
      console.error('Failed to fetch username:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchMeta();
  }, [id]);

  const handleLock = async () => {
    if (pageData?.locked) {
      if (hasPermission('portal.unlock')) {
        await toggleLock();
      } else {
        openRequestModal('UNLOCK');
      }
    } else {
      await toggleLock();
    }
  };

  const toggleLock = async () => {
    if (!pageData) return;
    setToggling(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/dialog/${id}/lock?uuid=${authUser?.uuid}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !pageData.locked }),
      });

      if (!res.ok) throw new Error('Failed to update lock status');

      await fetchMeta();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Could not toggle lock status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <div className="info-box">
        <h4>{toUpperCase("Dialog")}</h4>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {pageData && (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>Identifier</strong> <br /> {id}</li>
              <li><strong>Character Name</strong> <br /> {currentDialog?.char_name} </li>
              <li><strong>Created By</strong> <br /> {creatorName || '—'}</li>
              <li><strong>Last Edited By</strong> <br /> {editorName || '—'} ( {parseTime(`${pageData?.edited_at}`)} )</li>
            </ul>
          </>
        )}
      </div>
      <div className="info-box">
        <h4>Actions</h4>
        {pageData && (
          <>
            <button onClick={handleLock} disabled={toggling} className="meta-page-button">
              {pageData.locked ? 'Unlock Page' : 'Lock Page'}
            </button>

            {dialog && (
              <button onClick={openDialogModal} className="meta-page-button">
                Dialog Settings
              </button>
            )}

            <button onClick={backToList} disabled={toggling} className="meta-page-button">
              Back to List 
            </button>
            <button
                onClick= {hasPermission('portal.dialogs.delete') ? handleDelete : () => openRequestModal('DELETE')}
                disabled={toggling} className="meta-page-button" style={{color: 'var(--danger)'}}>
              Delete Dialog
            </button>
          </>
        )}
      </div>

      <Modal
          isOpen={showRequestModal}
          onClose={closeRequestModal}
          title={`${requestType.charAt(0).toUpperCase() + requestType.toLowerCase().substring(1,requestType.length)} Request `}
      >
        <div className="form-group">
          <p>
            <strong>{`Requesting ${requestType.toLowerCase()} for:`}</strong> Dialog / {id}
          </p>

          <label>Reason for {`${requestType.charAt(0).toUpperCase() + requestType.toLowerCase().substring(1, requestType.length)} Request `}</label>
          <textarea
              className="form-control"
              rows={4}
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              placeholder={`Explain why you need to ${requestType.toLowerCase()} this item...`}
          />

          {submitError && <p className="text-danger">{submitError}</p>}
        </div>

        <div className="modal-actions">
          <button
              className="btn btn-secondary"
              onClick={closeRequestModal}
              disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
              className="btn btn-primary"
              onClick={handleRequestSubmit}
              disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showDialogModal}
        onClose={closeDialogModal}
        title="Dialog Settings"
      >
        <div className="form-group">
          <label>Character Name</label>
          <input
            type="text"
            className="form-control"
            required
            value={dialogForm.char_name}
            onChange={(e) => setDialogForm({...dialogForm, char_name: e.target.value})}
          />

          <label>Character Name Color</label>
          <input
            type="color"
            className="form-control"
            value={dialogForm.char_name_color}
            onChange={(e) => setDialogForm({...dialogForm, char_name_color: e.target.value || "#4f4a3e"})}
          />
          <label>Text Color</label>
          <input
            type="color"
            className="form-control"
            value={dialogForm.text_color}
            onChange={(e) => setDialogForm({...dialogForm, text_color: e.target.value || "#4f4a3e"})}
          />
          <label>Background Color</label>
          <input
            type="color"
            className="form-control"
            value={dialogForm.background_color}
            onChange={(e) => setDialogForm({...dialogForm, background_color: e.target.value || "#f8ffe0"})}
          />
          <label>Answer Background Color</label>
          <input
            type="color"
            className="form-control"
            value={dialogForm.answer_background_color}
            onChange={(e) => setDialogForm({...dialogForm, answer_background_color: e.target.value || "#f8ffe0"})}
          />
          <label>Fog Color</label>
          <input
            type="color"
            className="form-control"
            value={dialogForm.fog_color}
            onChange={(e) => setDialogForm({...dialogForm, fog_color: e.target.value || "#000000"})}
          />
          <label>Arrow Color</label>
          <input
            type="color"
            className="form-control"
            value={dialogForm.arrow_color}
            onChange={(e) => setDialogForm({...dialogForm, arrow_color: e.target.value || "#cdff29"})}
          />
          <label>Selected Color</label>
          <input
            type="color"
            className="form-control"
            value={dialogForm.selected_color}
            onChange={(e) => setDialogForm({...dialogForm, selected_color: e.target.value || "#4f4a3e"})}
          />

          {submitError && <p className="text-danger">{submitError}</p>}
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={closeDialogModal}
            disabled={isSavingDialog}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleDialogSubmit}
            disabled={isSavingDialog}
          >
            {isSavingDialog ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DialogMetaBox;