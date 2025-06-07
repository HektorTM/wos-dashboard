const express = require('express');
const router = express.Router();
let Octokit;

(async () => {
  const { Octokit: OctokitImport } = await import('@octokit/rest');
  Octokit = OctokitImport;
})();

let octokit;
router.use(async (req, res, next) => {
  if (!octokit && Octokit) {
    octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }
  next();
});

// Create new issue
router.post('/issues', async (req, res) => {
  const { repo, title, description, user } = req.body;

  // Validation
  if (!repo || !title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return res.status(400).json({ error: 'Invalid repository format' });
  }

  try {
    const [owner, repoName] = repo.split('/');

    const { data } = await octokit.issues.create({
      owner,
      repo: repoName,
      title: title.length > 100 ? `${title.substring(0, 97)}...` : title,
      body: `## Description\n${description}\n\n_Reported via Staff Portal by_ **${user}**`,
      labels: ['bug']
    });

    res.json({
      id: data.id,
      number: data.number,
      html_url: data.html_url,
      title: data.title,
      state: data.state
    });
  } catch (error) {
    console.error('GitHub API Error:', error);
    res.status(500).json({ error: 'Failed to create GitHub issue' });
  }
});

// Get all open issues
router.get('/issues', async (req, res) => {
  const { repo = 'all', page = 1, per_page = 10 } = req.query;
  
  try {
    // Define all repositories you want to query when 'all' is selected
    const allRepos = [
      { owner: 'HektorTM', repo: 'wos-dashboard' },
      { owner: 'HektorTM', repo: 'WoSSystems' },
      { owner: 'HektorTM', repo: 'WoSCore' }
    ];

    // If a specific repo is selected, filter to just that one
    const reposToQuery = repo === 'all' 
      ? allRepos
      : allRepos.filter(r => `${r.owner}/${r.repo}` === repo);

    // Fetch issues from all selected repositories
    const issuesPromises = reposToQuery.map(async ({ owner, repo }) => {
      try {
        const { data } = await octokit.issues.listForRepo({
          owner,
          repo,
          state: 'open',
          sort: 'created',
          direction: 'desc',
          per_page: Number(per_page),
          page: Number(page)
        });
        
        return data.map(issue => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          html_url: issue.html_url,
          repository: `${owner}/${repo}`,
          repo_name: repo,
          created_at: issue.created_at,
          state: issue.state
        }));
      } catch (error) {
        console.error(`Error fetching issues for ${owner}/${repo}:`, error);
        return []; // Return empty array if there's an error with one repo
      }
    });

    const issuesArrays = await Promise.all(issuesPromises);
    const allIssues = issuesArrays.flat();
    
    // Sort by creation date (newest first)
    allIssues.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(per_page);
    const paginatedIssues = allIssues.slice(startIndex, startIndex + Number(per_page));
    
    res.json(paginatedIssues);
  } catch (error) {
    console.error('Error in issues endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

module.exports = router;
