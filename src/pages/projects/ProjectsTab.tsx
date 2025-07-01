import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DeleteButton from '../../components/DeleteButton';
import EditButton from '../../components/EditButton';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateCosmeticPopup from './CreateProjectPopUp';
import { getStaffUserByUUID } from '../../utils/parser';
import TitleComp from '../../components/TitleComponent';

type Project = {
  id: string;
  uuid: string;
  title: string;
  public: boolean;
};

const ProjectsTab = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authUser } = useAuth();
  
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await fetchType('projects');
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects([...projects, newProject]);
  }

  const deleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Project?')) return;

    try {
      deletePageItem('projects', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('project', `${id}`, `${authUser?.uuid}`);
      setProjects(projects.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const filteredProjects = projects.filter((c) =>
    [c.id, c.title].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Projects | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Projects</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Projects...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>Identifier</th>
                <th style={{padding: '4px 8px'}}>Title</th>
                <th style={{padding: '4px 8px'}}>Created by</th>
                <th style={{padding: '4px 8px'}}>Public</th>
                <th style={{padding: '4px 8px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} style={{height: '32px'}}>
                  <td style={{ padding: '4px 8px' }}>{project.id}</td>
                  <td style={{ padding: '4px 8px' }}>{project.title}</td>
                  <td style={{ padding: '4px 8px' }}>{getStaffUserByUUID(project.uuid)}</td>
                  <td style={{ padding: '4px 8px' }}>{project.public ? '✅' : '❌'}</td>
                  <td style={{padding: '4px 8px'}}>
                    <EditButton perm='COSMETIC_EDIT' nav={`/view/project/${project.id}`} ></EditButton>
                    <DeleteButton perm='COSMETIC_DELETE' onClick={() => deleteProject(project.id)}></DeleteButton>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching Projects found' : 'No Projects available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateCosmeticPopup 
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectsTab;
