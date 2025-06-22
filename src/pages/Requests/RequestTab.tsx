import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fetchType } from '../../helpers/FetchPageItem';
import { parseTime } from '../../utils/parser';
import { usePermission } from '../../utils/usePermission';
import TitleComp from '../../components/TitleComponent';

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
  const [action, setAction] = useState<'APPROVE' | 'DENY'>('APPROVE');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await fetchType('requests');
        setRequests(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRequestAction = async () => {
    if (!currentRequest) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${currentRequest.ind}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          uuid: authUser?.uuid
        })
      });

      if (!res.ok) throw new Error('Failed to process request');

      // Update local state
      setRequests(requests.map(req => 
        req.ind === currentRequest.ind 
          ? { ...req, action, action_time: new Date().toISOString(), acceptor: authUser?.uuid }
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
              <tr>
                <th>Type</th>
                <th>ID</th>
                <th>Request Type</th>
                <th>Requester</th>
                <th>Description</th>
                <th>Request Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.ind}>
                  <td>{request.type}</td>
                  <td>{request.id}</td>
                  <td>{request.request_type}</td>
                  <td>{request.requester_username}</td>
                  <td className="truncate-cell">{request.description}</td>
                  <td>{parseTime(request.request_time)}</td>
                  <td>
                    {request.action 
                      ? `${request.action} by ${request.acceptor}`
                      : 'Pending'}
                  </td>
                  <td>
                    {!request.action && hasPermission('UNLOCK') && (
                      <>
                        <button 
                          onClick={() => {
                            setCurrentRequest(request);
                            setAction('APPROVE');
                            setShowActionModal(true);
                          }}
                          className="action-button approve"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentRequest(request);
                            setAction('DENY');
                            setShowActionModal(true);
                          }}
                          className="action-button deny"
                        >
                          Deny
                        </button>
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

      {showActionModal && currentRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Action</h3>
            <p>
              You are about to <strong>{action.toLowerCase()}</strong> this request:
            </p>
            <div className="request-details">
              <p><strong>Type:</strong> {currentRequest.type}</p>
              <p><strong>ID:</strong> {currentRequest.id}</p>
              <p><strong>Description:</strong> {currentRequest.description}</p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowActionModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleRequestAction}
                className={`confirm-button ${action.toLowerCase()}`}
              >
                Confirm {action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTab;