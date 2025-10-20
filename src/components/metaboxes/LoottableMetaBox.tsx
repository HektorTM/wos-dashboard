import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { getStaffUserByUUID, parseTime, toUpperCase } from '../../utils/parser.tsx';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../utils/usePermission.ts';
import Modal from '../Modal.tsx';
import {Loottable} from "../../types/Loottable.tsx";

interface LoottableMetaBoxProps {
  id: string;
  loottable: Loottable;
}

interface PageData {
  created_by?: string;
  edited_by?: string;
  locked?: boolean;
  created_at?: string;
  edited_at?: string;
}

const LoottableMetaBox: React.FC<LoottableMetaBoxProps> = ({ id, loottable }) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [currentLoottable, setCurrentLoottable] = useState<Loottable | undefined>();
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
  const [showModal, setShowModal] = useState(false);
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [loottableForm, setLoottableForm] = useState({
      amount: loottable.amount ?? 0,
      name: loottable.name ?? '',
  })
  const [isSavingLoottable, setIsSavingLoottable] = useState(false);

  useEffect(() => {
    setCurrentLoottable(loottable);
    setLoottableForm({
        amount: loottable?.amount ?? 0,
        name: loottable?.name ?? '',
    })
  }, [id, loottable]);

  const openRequestModal = (rType:string) => {
    setRequestType(rType);
    setShowRequestModal(true)
  };
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestDescription('');
    setSubmitError('');
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleDialogSubmit = async () => {
    setIsSavingLoottable(true);
    setSubmitError('');

    const payload = {
      amount: loottableForm.amount,
      name: loottableForm.name,
    };

    try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/loottables/${id}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
          });

          if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err?.error || `HTTP ${res.status}`);
          }

          alert('Loottable settings updated successfully!');
          closeModal();
      } catch (e: any) {
      console.error('Loottable update error:', e);
      setSubmitError(e.message || 'Failed to update Loottable settings');
    } finally {
      setIsSavingLoottable(false);
    }
  };


  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this Loottable?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/loottables/${id}?uuid=${authUser?.uuid}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Delete failed:', errorData);
        alert(`Failed to delete Loottable: ${errorData.error}`);
        return;
      }

      alert('Loottable deleted successfully!');
      backToList();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete Loottable');
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
    navigate('/loottables');
  };

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/loottable/${id}`, {
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
        <h4>{toUpperCase("Loottable")}</h4>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {pageData && (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>Identifier</strong> <br /> {id}</li>
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

            {loottable && (
              <button onClick={openModal} className="meta-page-button">
                Loottable Settings
              </button>
            )}

            <button onClick={backToList} disabled={toggling} className="meta-page-button">
              Back to List 
            </button>
            <button
                onClick= {hasPermission('portal.loottables.delete') ? handleDelete : () => openRequestModal('DELETE')}
                disabled={toggling} className="meta-page-button" style={{color: 'var(--danger)'}}>
              Delete Loottable
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
            <strong>{`Requesting ${requestType.toLowerCase()} for:`}</strong> Loottable / {id}
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
        isOpen={showModal}
        onClose={closeModal}
        title="Loottable Settings"
      >
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            className="form-control"
            required
            value={loottableForm.amount}
            onChange={(e) => setLoottableForm({...loottableForm, amount: parseInt(e.target.value)})}
          />

          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={loottableForm.name}
            onChange={(e) => setLoottableForm({...loottableForm, name: e.target.value || ""})}
          />

          {submitError && <p className="text-danger">{submitError}</p>}
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={closeModal}
            disabled={isSavingLoottable}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleDialogSubmit}
            disabled={isSavingLoottable}
          >
            {isSavingLoottable ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LoottableMetaBox;