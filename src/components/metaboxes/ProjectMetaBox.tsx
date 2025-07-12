import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { getStaffUserByUUID, parseTime } from '../../utils/parser.tsx';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../utils/usePermission.ts';
import Modal from '../Modal.tsx';
import UserList from '../UserList.tsx';

interface Project {
  id: string;
  uuid: string;
  name: string;
  public: boolean;
  notes: string;
  items?: ProjectItem[];
  members?: ProjectMember[];
}


interface ProjectItem {
  id: string;
  type: string;
  item_id: string;
  added_by: string;
}

interface ProjectMember {
  id: string;
  uuid: string;
  username?: string;
}

interface ProjectMetaBoxProps {
  id: string;
  project?: Project;
  onMemberUpdate?: () => void;
  onItemUpdate?: () => void;
  onPublicUpdate?: () => void;
}


interface PageData {
  created_by?: string;
  edited_by?: string;
  locked?: boolean;
  created_at?: string;
  edited_at?: string;
}

const ProjectMetaBox: React.FC<ProjectMetaBoxProps> = ({ id, project, onMemberUpdate, onItemUpdate, onPublicUpdate }) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [editorName, setEditorName] = useState<string | null>(null);
  const { authUser } = useAuth();
  const { hasPermission } = usePermission();

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [newMember, setNewMember] = useState('');
  const [newItem, setNewItem] = useState({
    type: '',
    item_id: ''
  });
  const [requestDescription, setRequestDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project]);

  const closeMemberModal = () => setShowMemberModal(false);
  const openMemberModal = () => setShowMemberModal(true);

  const closeAddItemModal = () => setShowAddItemModal(false);
  const openAddItemModal = () => setShowAddItemModal(true);

  const openRequestModal = () => setShowRequestModal(true);
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestDescription('');
    setSubmitError('');
  };

  const handleJoinProject = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: authUser?.uuid })
      });

      if (!res.ok) throw new Error('Failed to join project');

      alert('Joined project successfully!');
      onMemberUpdate?.(); // Call the update callback
    } catch (error) {
        console.error('Join project error:', error);
        alert('Failed to join project');
    }
  }

  const handleLeaveProject = async () => {
    if (!confirm('Are you sure you want to leave this project?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: authUser?.uuid })
      });

      if (!res.ok) throw new Error('Failed to leave project');

      alert('Left project successfully!');
      onMemberUpdate?.(); // Call the update callback
    } catch (error) {
      console.error('Leave project error:', error);
      alert('Failed to leave project');
    }
  }

  const handleAddMember = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/user`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: newMember })
      });

      if (!res.ok) throw new Error('Failed to add member');

      alert('Member added successfully!');
      closeMemberModal();
      setNewMember('');
      onMemberUpdate?.(); // Call the update callback
    } catch (err) {
      console.error('Add member error:', err);
      setSubmitError('Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://admin.worldofsorcery.com/view/project/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRemoveMember = async (uuid: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/user`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid })
      });

      if (!res.ok) throw new Error('Failed to remove member');

      alert('Member removed successfully!');
      onMemberUpdate?.(); // Call the update callback
    } catch (err) {
      console.error('Remove member error:', err);
      setSubmitError('Failed to remove member');
    }
  };

  const handleAddItem = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newItem.type,
          item_id: newItem.item_id,
          uuid: authUser?.uuid
        })
      });

      if (!res.ok) throw new Error('Failed to add item');

      alert('Item added successfully!');
      closeAddItemModal();
      setNewItem({ type: '', item_id: '' });
      onItemUpdate?.(); // Call the update callback
    } catch (err) {
      console.error('Add item error:', err);
      setSubmitError('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = () => {
    return authUser?.uuid === project?.uuid;
  }

  const isMember = () => {
    return project?.members?.some(member => member.uuid === authUser?.uuid);
  }

  const handlePublicUpdate = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicState: project?.public ? 0 : 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to update public state');
      }
      alert('Public state updated successfully!');
        onPublicUpdate?.(); // Call the update callback
    } catch (err) {
      console.error(err);
      alert('Failed to update notes');
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
          type: 'project',
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
    navigate('/projects');
  };

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/project/${id}`, {
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
      if (hasPermission('UNLOCK') || authUser?.uuid == pageData.created_by) {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/page-data/project/${id}/lock?uuid=${authUser?.uuid}`, {
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
          <h4>{`${currentProject?.name || 'Loading...'}`}</h4>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {pageData && (
              <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li><strong>Identifier</strong> <br /> {id}</li>
                  <li><strong>Created By</strong> <br /> {creatorName || '—'}</li>
                  <li><strong>Public?</strong> <br />{project?.public ? '✅' : '❌'}</li>
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
                  {pageData.locked ? 'Unlock Project' : 'Lock Project'}
                </button>
                {isOwner() ? (
                    <button onClick={openMemberModal} className="meta-page-button">
                      Manage Members
                    </button>
                ) : isMember() || project?.public ? (
                    <button onClick={handleLeaveProject} className="meta-page-button">
                      Leave Project
                    </button>
                ) : (
                    <button onClick={handleJoinProject} className="meta-page-button">
                      Join Project
                    </button>
                )}


                { !pageData.locked && (
                    <button onClick={openAddItemModal} className="meta-page-button">
                      Add Item
                    </button>
                )}

                {isOwner() && (
                    <button className="meta-page-button" onClick={handlePublicUpdate}>
                      {project?.public ? 'Make Private' : 'Make Public'}
                    </button>
                )}

                <button
                  onClick={handleCopy}
                  className="meta-page-button"
                  >

                  {copied ? 'Project Link Copied!' : 'Share Project Link'}
                </button>
                <button onClick={backToList} disabled={toggling} className="meta-page-button">
                  Back to List
                </button>
              </>
          )}
        </div>

        {/* Request Unlock Modal */}
        <Modal
            isOpen={showRequestModal}
            onClose={closeRequestModal}
            title="Request Project Unlock"
        >
          <div className="form-group">
            <p>
              <strong>Requesting unlock for:</strong> Project / {id}
            </p>

            <label>Reason for Unlock Request</label>
            <textarea
                className="form-control"
                rows={4}
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder="Explain why you need to unlock this project..."
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

        {/* Manage Members Modal */}
        <Modal
            isOpen={showMemberModal}
            onClose={closeMemberModal}
            title="Manage Project Members"
        >
          <div className="form-group">
            <label>Add New Member</label>
            <div className="input-group mb-3">
              <UserList
                  value={newMember}
                  onChange={(uuid) => setNewMember(uuid)}
              />
              <button
                  className="btn btn-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember}
                  onClick={handleAddMember}
                  disabled={isSubmitting || !newMember || project?.members?.some(member => member.uuid === newMember)}
              >
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>

            <div className="members-list">
              <h5>Current Members</h5>
              {project?.members?.map(member => (
              <div key={member.uuid} className="member-item" style={{paddingBottom:'5px'}}>
                <button
                    onClick={() => handleRemoveMember(member.uuid)}
                    className="btn btn-sm btn-danger"
                >
                  Remove
                </button>
                <span style={{marginLeft: '10px'}}>{member.username}</span>
              </div>
            ))}
            </div>

            {submitError && <p className="text-danger">{submitError}</p>}
          </div>
        </Modal>

        {/* Add Item Modal */}
        <Modal
            isOpen={showAddItemModal}
            onClose={closeAddItemModal}
            title="Add Item to Project"
        >
          <div className="form-group">
            <label>Item Type</label>
            <select
                className="form-control mb-3"
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value})}
            >
              <option value="">Select type</option>
              <option value="citem">Citem</option>
              <option value="cooldown">Cooldown</option>
              <option value="cosmetic">Cosmetic</option>
              <option value="currency">Currency</option>
              <option value="fish">Fish</option>
              <option value="gui">GUI</option>
              <option value="interaction">Interaction</option>
              <option value="loottable">Loot Table</option>
              <option value="recipes">Recipes</option>
              <option value="stat">Stat</option>
              <option value="unlockable">Unlockable</option>
              <option value="warp">Warp</option>
              <option value="spell">Spell</option>
            </select>

            <label>Item ID</label>
            <input
                className="form-control mb-3"
                placeholder="Enter item ID"
                value={newItem.item_id}
                onChange={(e) => setNewItem({...newItem, item_id: e.target.value})}
            />

            {submitError && <p className="text-danger">{submitError}</p>}
          </div>

          <div className="modal-actions">
            <button
                className="btn btn-secondary"
                onClick={closeAddItemModal}
                disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
                className="btn btn-primary"
                onClick={handleAddItem}
                disabled={isSubmitting || !newItem.type || !newItem.item_id}
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </Modal>
      </div>
  );
};

export default ProjectMetaBox;