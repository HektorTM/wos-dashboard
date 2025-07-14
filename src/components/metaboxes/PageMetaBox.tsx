
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { getStaffUserByUUID, parseTime, toUpperCase } from '../../utils/parser.tsx';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../utils/usePermission.ts';
import Modal from '../Modal.tsx';
import {PermissionKey} from "../../utils/permissions.ts";

interface PageMetaBoxProps {
  type: string;
  id: string;
  deletePerm?: PermissionKey;
}

interface PageData {
  created_by?: string;
  edited_by?: string;
  locked?: boolean;
  created_at?: string;
  edited_at?: string;
}

const PageMetaBox: React.FC<PageMetaBoxProps> = ({ type, id, deletePerm }) => {
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
    const [requestType, setRequestType] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const openRequestModal = (rType:string) => {
    setRequestType(rType);
    setShowRequestModal(true)
  };
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestDescription('');
    setSubmitError('');
  };

  const handleDelete = async () => {
    if (deletePerm == undefined || !hasPermission(deletePerm)) {
      alert('You do not have permission to delete this item.');
      return;
    }


    if (!window.confirm(`Are you sure you want to delete this ${toUpperCase(type)}?`)) {
      return;
    }

    let destination = type;
    if (destination === "currency") {
      destination = "currencies";
    } else if (destination === "fish") {
      destination = "fishies";
    } else {
      destination = destination+"s";
    }

    try {
      console.log('Deleting item:', type, id);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/${type}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        console.log('Item deleted successfully');
      } else {
        const errorData = await res.json();
        console.error('Delete failed:', errorData);
        alert(`Failed to delete ${toUpperCase(type)}: ${errorData.error}`);
        return;
      }

      const res2 = await fetch(`${import.meta.env.VITE_API_URL}/api/${destination}/${id}?uuid=${authUser?.uuid}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        if (!res2.ok) {
            const errorData = await res2.json();
            console.error('Delete failed:', errorData);
            alert(`Failed to delete ${toUpperCase(type)}: ${errorData.error}`);
            return;
        }
      alert(`${toUpperCase(type)} deleted successfully!`);
      await backToList()
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete item');
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
          request_type: requestType,
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
        openRequestModal('UNLOCK');
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
            <button
              onClick= {deletePerm != undefined && hasPermission(deletePerm) ? handleDelete : () => openRequestModal('DELETE')}
              disabled={toggling} className="meta-page-button" style={{color: 'var(--danger)'}}>
              Delete {toUpperCase(type?.toString())}
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
            <strong>{`Requesting ${requestType.toLowerCase()} for:`}</strong> {type} / {id}
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

    </div>
    
    
  );
};

export default PageMetaBox;
