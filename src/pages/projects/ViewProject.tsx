// ViewProject.tsx
import { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { fetchLocked } from '../../helpers/PageMeta';
import Spinner from '../../components/Spinner';
import TitleComp from '../../components/TitleComponent';
import ProjectMetaBox from "../../components/metaboxes/ProjectMetaBox.tsx";
import DeleteButton from "../../components/buttons/DeleteButton.tsx";
import {useAuth} from "../../context/AuthContext.tsx";

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
    added_by_username?: string;
}

interface ProjectMember {
    id: string;
    uuid: string;
    username?: string;
}

const ViewProject = () => {
    const { authUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);

    const fetchProjectData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Project not found');
            }
            const data = await response.json();

            const membersWithUsernames = await Promise.all(
                (data?.users || []).map(async (member: ProjectMember) => {
                    try {
                        const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${member.uuid}`, {
                            method: 'GET',
                            credentials: 'include',
                        });
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            return { ...member, username: userData.username };
                        }
                    } catch (err) {
                        console.error(err);
                    }
                    return { ...member, username: 'Unknown User' };
                })
            );

            const itemsWithUsernames = await Promise.all(
                (data?.items || []).map(async (item: ProjectItem) => {
                    try {
                        const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${item.added_by}`, {
                            method: 'GET',
                            credentials: 'include',
                        });
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            return { ...item, added_by_username: userData.username };
                        }
                    } catch (err) {
                        console.error(err);
                    }
                    return { ...item, added_by_username: 'Unknown User' };
                })
            );

            setProject({
                id: data.data[0].id,
                uuid: data.data[0].uuid,
                name: data.data[0].name,
                public: data.data[0].public,
                notes: data.data[0].notes,
                items: itemsWithUsernames,
                members: membersWithUsernames
            });
        } catch (err) {
            console.error(err);
            setError('Failed to fetch Project Data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (type: string, itemId: string) => {
        if (!window.confirm(`Are you sure you want to delete this ${type} with ID ${itemId}?`)) {
            return;
        }
        const payload = {
            type: type,
            item_id: itemId,
        }
        try {

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/items`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error('Failed to delete item');
            }
            alert('Item deleted successfully!');
            fetchProjectData(); // Refresh project data after deletion
        } catch (err) {
            console.error(err);
            alert('Failed to delete item');
        }
    }

    const goToItem = (type: string, itemId: string) => {
        navigate(`/view/${type}/${itemId}`);
    }

    useEffect(() => {
        if (id) {
            fetchProjectData();
        }
    }, [id]);

    const fetchLockedValue = async () => {
        try {
            const result = await fetchLocked('project', `${id}`);
            setLocked(result == 1);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLockedValue();
    }, [id]);
    
    const handleSubmit = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: project?.notes })
            });

            if (!response.ok) {
                throw new Error('Failed to update notes');
            }
            alert('Notes updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update notes');
        }
    };
    const handlePublicUpdate = () => {
        fetchProjectData();
    }

    const handleMemberUpdate = () => {
        fetchProjectData(); // Refresh project data after member change
    };

    const handleItemUpdate = () => {
        fetchProjectData(); // Refresh project data after item change
    };

    return (
        <div className={`page-container ${theme}`}>
            <TitleComp title={`Project | ${project?.name}`} />
            {!project?.public && !(project?.members?.some(member => member.uuid === authUser?.uuid) && authUser?.uuid !== project?.uuid) ? (
                <div>
                    <div className="alert alert-warning">
                        This project is private. You do not have access to view it.
                    </div>
                    <span>:(</span>
                </div>

            ) : (



            <div
                className="form-meta-container"
                style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
            >
                {project ? (
                    <ProjectMetaBox
                        id={`${id}`}
                        project={project}
                        onMemberUpdate={handleMemberUpdate}
                        onItemUpdate={handleItemUpdate}
                        onPublicUpdate={handlePublicUpdate}
                    />
                ) : (
                    <div> Loading project data...</div>
                )}
                <div style={{ flex: 4 }}>
                    {error && <div className="error-message">{error}</div>}
                    {locked && (
                        <div className="alert alert-warning page-input">
                            This Project is locked and cannot be edited.
                        </div>
                    )}

                    {loading ? (
                        <Spinner type="Project" />
                    ) : project ? (
                        <div>
                            <h3>Project Items ({project.items?.length || 0})</h3>
                            {project.items?.length ? (
                                <div className="item-table-container">
                                    <table className="item-table">
                                        <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Item ID</th>
                                            <th>Added By</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {project.items.map((item) => (
                                            <tr key={`${item.type}-${item.item_id}`} >
                                                <td onClick={() => goToItem(item.type, item.item_id)}>{item.type}</td>
                                                <td onClick={() => goToItem(item.type, item.item_id)}>{item.item_id}</td>
                                                <td onClick={() => goToItem(item.type, item.item_id)}>{item.added_by_username || item.added_by}</td>
                                                <td style={{width: '10px'}}>
                                                    {!locked && ( <DeleteButton onClick={() => handleDeleteItem(item.type, item.item_id)}></DeleteButton> )}
                                                ️</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p>No items in this project</p>
                            )}
                        </div>
                    ) : (
                        <p>Project not found</p>
                    )}
                </div>

                <div className="member-notes-container">
                    <div className="member-tab card" style={{ flex: 1, border: '1px solid var(--border-color)' }}>
                        <div className="card-header" style={{backgroundColor: 'var(--table-header-bg)', color: 'var(--text-color)'}}>
                            <h3>Members ({project?.members?.length || 0})</h3>
                        </div>
                        <div className="card-body" style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}>
                            {project?.members?.length ? (
                                <ul className="list-group" >
                                    {project.members.map((member) => (
                                        <li key={member.uuid} className="list-group-item" style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)'}}>
                                            {member.username || member.uuid}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No members in this project</p>
                            )}
                        </div>
                    </div>

                    <div className="notes card" style={{ flex: 1, border: '1px solid var(--border-color)' }}>
                        <div className="card-header" style={{backgroundColor: 'var(--table-header-bg)', color: 'var(--text-color)'}}>
                            <h3>Notes</h3>
                        </div>
                        <div className="card-body" style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}>
                            <div className="form-group">
                                <textarea
                                    className="form-control"
                                    value={project?.notes || ''}
                                    onChange={(e) => project && setProject({ ...project, notes: e.target.value })}
                                    rows={8}
                                    disabled={locked}
                                />
                                {!locked && (
                                    <button
                                        className="btn btn-primary mt-2"
                                        onClick={handleSubmit}
                                    >
                                        Save Notes
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default ViewProject;