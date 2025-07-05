
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { getStaffUserByUUID, parseTime, toUpperCase } from '../../utils/parser.tsx';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../utils/usePermission.ts';
import Modal from '../Modal.tsx';

interface PageMetaBoxProps {
  type: string;
  id: string;
}

interface PageData {
  created_by?: string;
  edited_by?: string;
  locked?: boolean;
  created_at?: string;
  edited_at?: string;
}

const PageMetaBox: React.FC<PageMetaBoxProps> = ({ type, id }) => {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [editorName, setEditorName] = useState<string | null>(null);
  const { authUser } = useAuth();
  const { hasPermission } = usePermission();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const openRequestModal = () => setShowRequestModal(true);
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestDescription('');
    setSubmitError('');
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
          type,
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
      setSubmitError( 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToList = async () => {
    let destination = type;
    if (destination === "currency") {
      destination = "currencies";
    } else if (destination === "fish") {
      destination = "fishing";
    } else {
      destination = destination+"s";
    }
    navigate(`/${destination}`)
  }

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/${type}/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load metadata');
      const result = await res.json();
      setData(result);

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
  }, [type, id]);

  

  const handleLock = async () => {
    if (data?.locked) {
      if (hasPermission('UNLOCK')) {
        toggleLock();
      } else {
        openRequestModal();
      }
    } else {
      toggleLock();
    }
  };

  

  const toggleLock = async () => {
    if (!data) return;
    setToggling(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/${type}/${id}/lock?uuid=${authUser?.uuid}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !data.locked }),
      });

      if (!res.ok) throw new Error('Failed to update lock status');

      await fetchMeta(); // Refresh metadata after lock change
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
        <h4>{toUpperCase(type?.toString())}</h4>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>Identifier</strong> <br /> {id}</li>
              <li><strong>Created By</strong> <br /> {creatorName || '—'}</li>
              <li><strong>Last Edited By</strong> <br /> {editorName || '—'} ( {parseTime(`${data?.edited_at}`)} )</li>
            </ul>
          </>
        )}
      </div>
      <div className="info-box">
        <h4>Actions</h4>
        {data && (
          <>
            <button onClick={handleLock} disabled={toggling} className="meta-page-button">
              {data.locked ? 'Unlock Page' : 'Lock Page'}
            </button>
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
            <strong>Requesting unlock for:</strong> {type} / {id}
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

    </div>
    
    
  );
};

export default PageMetaBox;
