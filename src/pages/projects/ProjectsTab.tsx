import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import TitleComp from '../../components/TitleComponent';
import CreateProjectPopUp from "./CreateProjectPopUp";
import {ProjectEditButton} from "../../components/buttons/ProjectEditButton.tsx";
import {ProjectDeleteButton} from "../../components/buttons/ProjectDeleteButton.tsx";
import {getStaffUserByUUID} from "../../utils/parser.tsx";

type Project = {
  id: string;
  uuid: string;
  name: string;
  public: boolean;
};

const ProjectsTab = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<(Project & { creatorName?: string})[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authUser } = useAuth();
  
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const rawProjects: Project[] = await fetchType('projects');

        // Then proceed with the full list
        const enrichedProjects = await Promise.all(
            rawProjects.map(async (project) => {
              let creatorName: string | undefined;
              try {
                if(project.uuid) {
                    creatorName = await parseUUIDToUsername(project.uuid);
                }
              } catch (err) {
                console.error(`Failed to fetch creator name for project ${project.id}:`, err);
              }
              return { ...project, creatorName };
            })
        );

        setProjects(enrichedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const parseUUIDToUsername = async (uuid: string): Promise<string | undefined> => {
    try {
      const response = await getStaffUserByUUID(uuid);
      return response?.username || undefined;
    } catch (error) {
      console.error('Failed to fetch username:', error);
      return undefined;
    }
  };

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
    [c.id, c.name].some((field) =>
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
                  <td style={{ padding: '4px 8px' }}>{project.name}</td>
                  <td style={{ padding: '4px 8px' }}>{project.creatorName || '-'}</td>
                  <td style={{ padding: '4px 8px' }}>{project.public ? '✅' : '❌'}</td>
                  <td style={{padding: '4px 8px'}}>
                    <ProjectEditButton id={project.id} nav={`/view/project/${project.id}`}></ProjectEditButton>
                    <ProjectDeleteButton id={project.id} onClick={() => deleteProject(project.id)}></ProjectDeleteButton>
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
        <CreateProjectPopUp
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectsTab;
