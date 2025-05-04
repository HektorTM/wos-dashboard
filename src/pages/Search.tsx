import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


type SearchResultItem = {
  id: string;
  label: string;
  type: string;
};

type SearchResultsData = {
  query: string;
  results: {
    [key: string]: SearchResultItem[];
  };
  total: number;
};

const useQuery = () => new URLSearchParams(useLocation().search);

const typeLabels: Record<string, string> = {
  user: 'Users',
  citem: 'Citems',
  cosmetic: 'Cosmetics',
  channel: 'Channels',
  player: 'Players',
  unlockable: 'Unlockables',
  currency: 'Currencies'
};

const SearchResults = () => {

  const query = useQuery().get('q') || '';
  const [results, setResults] = useState<SearchResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
        const data: SearchResultsData = await res.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (type: string, id: string) => {
    navigate(`/view/${type}/${id}`);
  };

  if (!query) {
    return (
      <div className="search-page">
        <div className="info-message">Please enter a search term</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="search-page text-center">
        <div className="spinner"></div>
        <p>Searching for "{query}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-page">
        <div className="error-message">
          <h3>Search Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <h2>Search Results for "{query}"</h2>
      
      {results ? (
        <>
          <p className="results-count">Found {results.total} results</p>
          
          {Object.keys(results.results).length === 0 ? (
            <div className="no-results">No results found for your search.</div>
          ) : (
            <div className="results-grid">
              {Object.entries(results.results).map(([type, items]) => (
                <div key={type} className="result-group">
                  <h3>{typeLabels[type] || type} <span>({items.length})</span></h3>
                  <div className="result-items">
                    {items.map((item) => (
                      <div 
                        key={`${type}-${item.id}`} 
                        className="result-item"
                        onClick={() => handleResultClick(type, item.id)}
                      >
                        <div className="item-content">
                          <span className="item-name">{item.id}</span>
                          <span className="item-type">{item.label === '0' ? 'Permanent' : item.label === '1' ? 'Temporary' : item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-results">No search results to display</div>
      )}
    </div>
  );
};

export default SearchResults;