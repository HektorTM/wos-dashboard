import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStaffUserByUUID, parseTime, toUpperCase } from '../utils/parser';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../utils/usePermission';
import Modal from './Modal';

interface Gui {
  id: string;
  size: number;
  title: string;
  open_actions: string[] | string;
  close_actions: string[] | string;
}

interface GuiMetaBoxProps {
  id: string;
  gui: Gui; // Changed from initialGui to gui for consistency
}

interface PageData {
  created_by?: string;
  edited_by?: string;
  locked?: boolean;
  created_at?: string;
  edited_at?: string;
}

const GuiMetaBox: React.FC<GuiMetaBoxProps> = ({ id, gui }) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [currentGui, setCurrentGui] = useState<Gui>(gui); // Renamed from gui to currentGui
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [editorName, setEditorName] = useState<string | null>(null);
  const { authUser } = useAuth();
  const { hasPermission } = usePermission();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showGuiModal, setShowGuiModal] = useState(false);
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [guiForm, setGuiForm] = useState({
    size: currentGui.size,
    title: currentGui.title,
    open_actions: Array.isArray(currentGui.open_actions) ? currentGui.open_actions.join('\n') : currentGui.open_actions,
    close_actions: Array.isArray(currentGui.close_actions) ? currentGui.close_actions.join('\n') : currentGui.close_actions
  });
  const [isSavingGui, setIsSavingGui] = useState(false);

  useEffect(() => {
    setCurrentGui(gui);
    setGuiForm({
      size: currentGui.size,
      title: currentGui.title,
      open_actions: Array.isArray(currentGui.open_actions) ? currentGui.open_actions.join('\n') : currentGui.open_actions,
      close_actions: Array.isArray(currentGui.close_actions) ? currentGui.close_actions.join('\n') : currentGui.close_actions
    });
  }, [gui]);

  const openRequestModal = () => setShowRequestModal(true);
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestDescription('');
    setSubmitError('');
  };

  const openGuiModal = () => setShowGuiModal(true);
  const closeGuiModal = () => setShowGuiModal(false);

  const handleGuiSubmit = async () => {
    setIsSavingGui(true);
    try {
      const payload = {
        ...guiForm,
        open_actions: guiForm.open_actions.split('\n').filter(action => action.trim()),
        close_actions: guiForm.close_actions.split('\n').filter(action => action.trim()),
        uuid: authUser?.uuid,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/guis/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update GUI settings');

      const updatedGui = await res.json();
      setCurrentGui(updatedGui);
      alert('GUI settings updated successfully!');
      closeGuiModal();
      setSubmitError('');
    } catch (err) {
      console.error('GUI update error:', err);
      setSubmitError('Failed to update GUI settings');
    } finally {
      setIsSavingGui(false);
    }
  };

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
          type: 'gui',
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
    navigate('/guis');
  };

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/gui/${id}`, {
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
      if (hasPermission('UNLOCK')) {
        await toggleLock();
      } else {
        openRequestModal();
      }
    } else {
      await toggleLock();
    }
  };

  const toggleLock = async () => {
    if (!pageData) return;
    setToggling(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/gui/${id}/lock?uuid=${authUser?.uuid}`, {
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
        <h4>{toUpperCase("Gui")}</h4>
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

            {gui && (
              <button onClick={openGuiModal} className="meta-page-button">
                GUI Settings
              </button>
            )}

            <button onClick={backToList} disabled={toggling} className="meta-page-button">
              Back to List 
            </button>
          </>
        )}
      </div>

      <Modal
        isOpen={showRequestModal}
        onClose={closeRequestModal}
        title="Request Page Unlock"
      >
        <div className="form-group">
          <p>
            <strong>Requesting unlock for:</strong> gui / {id}
          </p>
          
          <label>Reason for Unlock Request</label>
          <textarea
            className="form-control"
            rows={4}
            value={requestDescription}
            onChange={(e) => setRequestDescription(e.target.value)}
            placeholder="Explain why you need to unlock this page..."
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
        isOpen={showGuiModal}
        onClose={closeGuiModal}
        title="GUI Settings"
      >
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={guiForm.title}
            onChange={(e) => setGuiForm({...guiForm, title: e.target.value})}
          />

          <label>Size (1-6)</label>
          <input
            type="number"
            min="1"
            max="6"
            className="form-control"
            value={guiForm.size}
            onChange={(e) => setGuiForm({...guiForm, size: parseInt(e.target.value) || 3})}
          />

          <label>Open Actions (one per line)</label>
          <textarea
            className="form-control"
            rows={3}
            value={guiForm.open_actions}
            onChange={(e) => setGuiForm({...guiForm, open_actions: e.target.value})}
            placeholder="Enter actions, one per line"
          />

          <label>Close Actions (one per line)</label>
          <textarea
            className="form-control"
            rows={3}
            value={guiForm.close_actions}
            onChange={(e) => setGuiForm({...guiForm, close_actions: e.target.value})}
            placeholder="Enter actions, one per line"
          />
          
          {submitError && <p className="text-danger">{submitError}</p>}
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={closeGuiModal}
            disabled={isSavingGui}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleGuiSubmit}
            disabled={isSavingGui}
          >
            {isSavingGui ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GuiMetaBox;