import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {deletePageItem, fetchType} from '../../helpers/FetchPageItem';
import { parseTime } from '../../utils/parser';
import { usePermission } from '../../utils/usePermission';
import TitleComp from '../../components/TitleComponent';
import Modal from "../../components/Modal.tsx";
import {deletePageMeta} from "../../helpers/PageMeta.tsx";

type Request = {
  ind: number;
  request_type: string;
  type: string;
  id: string;
  requester: string;
  description: string;
  request_time: string;
  action?: string;
  action_time?: string;
  acceptor?: string;
  requester_username: string;
  acceptor_username?: string;
};

const RequestTab = () => {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authUser } = useAuth();
  const { hasPermission } = usePermission();

  const [showActionModal, setShowActionModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);

  const canView = hasPermission('REQUEST_VIEW');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      if (canView) {
        try {
          const data = await fetchType('requests');
          setRequests(data);
        } catch (err) {
          console.error('Error fetching all requests:', err);
          setError('Failed to load requests. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/me?uuid=${authUser?.uuid}`, {
            method: 'GET',
            credentials: 'include'
          });
          if (!res.ok) {
            console.error('Failed to fetch requests:', res.status, res.statusText);
            throw new Error('Failed to fetch requests');
          }
          const data = await res.json();
          setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Error fetching user requests:', err);
          setError('Failed to load your requests. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRequests();
  }, [authUser?.uuid, canView]);

  const handleUnlock = async (request: Request) => {
    try {
      console.log(`Unlocking item ${request.id} of type ${request.type}`);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/${request.type}/${request.id}/unlock?uuid=${authUser?.uuid}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        if (!res.ok) console.log("Failed to unlock item:", res.statusText);

    } catch (err) {
        console.log(err);
        setError('Failed to unlock item. Please try again.');
    }
  }

  const handleDelete = async (request: Request) => {
    let destination = request.type;
    if (destination === "currency") {
      destination = "currencies";
    } else if (destination === "fish") {
      destination = "fishing";
    } else {
      destination = destination+"s";
    }

    try {
      console.log(`Deleting item ${request.id} of type ${request.type}`);
      await deletePageItem(destination, request.id, `${authUser?.uuid}`);
      await deletePageMeta(request.type, request.id, `${authUser?.uuid}`);
    } catch (err) {
        console.log(err);
        setError('Failed to delete item. Please try again.');
    }
  }

  const showRequestModal = (request: Request) => {
    if (!hasPermission('REQUEST_APPROVE') && !hasPermission('REQUEST_DENY')) {
        return;
    }
    setCurrentRequest(request);
    setShowActionModal(true);
  }

  const viewItem = (type: string, id: string) => {
    window.open(`/view/${type}/${id}`, '_blank');
  }

  const handleRequestAction = async (action: string) => {
    if (!currentRequest) return;

    if (!window.confirm(`Are you sure you want to ${action === "APPROVED" ? "approve" : "deny"} this request?`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${currentRequest.ind}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: currentRequest.request_type,
          action,
          username: currentRequest.requester_username,
          uuid: authUser?.uuid
        })
      });

      if (!res.ok) {
        console.log("Failed to update request action:", res.statusText);
      }

      if (action === 'APPROVED') {
        console.log("Handling request");
        if (currentRequest.request_type === 'UNLOCK') {
          console.log("Handling unlock request");
          await handleUnlock(currentRequest);
        }
        else if (currentRequest.request_type === 'DELETE') {
            console.log("Handling delete request");
          await handleDelete(currentRequest);
        }
      }

      // Update local state
      setRequests(requests.map(req => 
        req.ind === currentRequest.ind 
          ? { ...req, action, action_time: new Date().toISOString(), acceptor: authUser?.uuid, acceptor_username: authUser?.username }
          : req
      ));

      setShowActionModal(false);
    } catch (err) {
      console.error(err);
      setError('Failed to process request. Please try again.');
    }
  };

  const filteredRequests = requests.filter((req) =>
    [req.type, req.id, req.request_type, req.requester].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Requests | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Unlock Requests</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by type, ID, requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading requests...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>Requester</th>
                <th style={{padding: '4px 8px'}}>Type/ID</th>
                <th style={{padding: '4px 8px'}}>Request Type</th>
                <th style={{padding: '4px 8px'}}>Request Time</th>
                <th style={{padding: '4px 8px'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr style={{height: '32px'}} key={request.ind} onClick={() => request.action != 'APPROVED' ? showRequestModal(request) : ''}>
                  <td style={{padding: '4px 8px'}}>{request.requester_username}</td>
                  <td style={{padding: '4px 8px'}}>{request.type}/{request.id}</td>
                  <td style={{padding: '4px 8px'}}>{request.request_type}</td>
                  <td style={{padding: '4px 8px'}}>{parseTime(request.request_time)}</td>
                  <td style={{ padding: '4px 8px' }}>
                    {request.action === 'PENDING' ? (
                        <span style={{color: 'yellow'}}>Pending</span>
                    ) : (
                        <>
                          {request.action === 'APPROVED' && (
                              <span style={{ color: 'lightgreen' }}>Approved</span>
                          )}
                          {request.action === 'DENIED' && (
                              <span style={{ color: 'tomato' }}>Denied</span>
                          )}
                          {` by ${request.acceptor_username}`}
                        </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="no-results">
                    {search ? 'No matching requests found' : 'No pending requests'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          title={`Handle ${currentRequest?.request_type} Request`}
      >
        <div className="form-control" style={{backgroundColor: "var(--bg-color)", color: "var(--text-color)", borderColor: "var(--bg-color)"}}>
          <p>
            <strong>Requester: </strong> {currentRequest?.requester_username}
          </p>
          <p>
            <strong>Type/ID: </strong> {currentRequest?.type}/{currentRequest?.id}
          </p>
          <textarea
            className="form-control"
            style={{borderColor: "var(--primary)"}}
            disabled
            value={currentRequest?.description || ''}
            rows={4}
          />
          <div className="modal-actions">
            <button
            className="btn btn-secondary"
            onClick={() => viewItem(`${currentRequest?.type != undefined ? currentRequest?.type : ''}`, `${currentRequest?.id != undefined ? currentRequest?.id : ''}`)}
            >
              {`View ${currentRequest?.type} (${currentRequest?.id})`}
            </button>
            <button
                className="btn btn-danger"
                onClick={() => handleRequestAction('DENIED')}
            >
              Deny
            </button>
            <button
                className="btn btn-success"
                onClick={() => handleRequestAction('APPROVED')}
            >
              Approve
            </button>
          </div>

        </div>

      </Modal>
    </div>
  );
};

export default RequestTab;