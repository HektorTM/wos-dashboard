import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import '../styles/components/BugReportPage.css';
import { useAuth } from '../context/AuthContext';
import TitleComp from '../components/TitleComponent';

type Repository = {
  name: string;
  value: string;
};

type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  repository: string;
  created_at: string;
  state: 'open' | 'closed';
  repo_name: string;
};

const BugReportPage = () => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authUser } = useAuth();
  const [formData, setFormData] = useState({
    repo: '',
    title: '',
    description: '',
    user: authUser?.username
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [selectedRepoFilter, setSelectedRepoFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const issuesPerPage = 10;

  const REPOSITORIES: Repository[] = [
    { name: "Web | Admin Portal", value: "HektorTM/wos-dashboard" },
    { name: "Plugin | Systems", value: "HektorTM/WoSSystems" },
    { name: "Plugin | Core", value: "HektorTM/WoSCore" },
    { name: "Plugin | Essentials", value: "HektorTM/WoSEssentials"}
  ];

  useEffect(() => {
    fetchOpenIssues();
  }, [selectedRepoFilter, currentPage]);

  const fetchOpenIssues = async () => {
    setIsLoadingIssues(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bugs/issues?repo=${selectedRepoFilter}&page=${currentPage}&per_page=${issuesPerPage}`,
        {
          credentials: 'include',
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch issues');
      
      const data = await response.json();
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues. Please try again.');
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ repo: '', title: '', description: '', user: authUser?.username});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the bug report');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bugs/issues`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create issue');

      const result = await response.json();
      toast.success(
        <div>
          Bug reported successfully!<br />
          <a href={result.html_url} target="_blank" rel="noopener noreferrer">
            View Issue #{result.number} on GitHub
          </a>
        </div>
      );
      closeModal();
      fetchOpenIssues();
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIssues = issues.filter((c) =>
      [c.title].some((field) =>
          String(field || '').toLowerCase().includes(search.toLowerCase())
      )
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOpenIssues();
  };

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Bug Reports | Staff Portal`}></TitleComp>
      <div className="page-header">

        <h2>Bug Reports</h2>
        <div className="page-search">
          <input
              type="text"
              placeholder="Search by ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button
          className="create-button" 
          onClick={openModal}
          style={{ marginLeft: 'auto' }}
        >
          New Bug Report
        </button>
      </div>

      <div className="bug-report-controls">
        <div className="repo-filter">
          <label htmlFor="repo-filter">Filter by Repository:</label>
          <select
            id="repo-filter"
            value={selectedRepoFilter}
            onChange={(e) => {
              setSelectedRepoFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Repositories</option>
            {REPOSITORIES.map((repo) => (
              <option key={repo.value} value={repo.value}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => {
            setCurrentPage(1);
            fetchOpenIssues();
          }} 
          className="btn-refresh"
          disabled={isLoadingIssues}
        >
          {isLoadingIssues ? 'Refreshing...' : 'Refresh Issues'}
        </button>
      </div>

      {isLoadingIssues ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading issues...</p>
        </div>
      ) : (
        <div className="issues-container">
          <>
            <table className="issues-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Repository</th>
                  <th>Title</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>#{issue.number}</td>
                    <td>{issue.repo_name}</td>
                    <td>
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="issue-link"
                      >
                        {issue.title}
                      </a>
                    </td>
                    <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`issue-status ${issue.state}`}>
                        {issue.state}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredIssues.length === 0 && (
                    <tr>
                      <td colSpan={7} className="no-results">
                        {search ? 'No matching issues found' : 'No issues available'}
                      </td>
                    </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={issues.length < issuesPerPage}
              >
                Next
              </button>
            </div>
          </>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Bug Report Form"
        className={`modal-content ${theme}`}
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div className="modal-header">
          <h3>Submit Bug Report</h3>
          <button onClick={closeModal} className="close-button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="bug-report-form">
          <div className="form-group">
            <label htmlFor="repo">Feature/Plugin:</label>
            <select
              id="repo"
              name="repo"
              value={formData.repo}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select</option>
              {REPOSITORIES.map((repo) => (
                <option key={repo.value} value={repo.value}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder="Brief description of the issue"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Details:</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder={`Steps to reproduce:`}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BugReportPage;