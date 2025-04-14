import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner, Alert, ListGroup, Card } from 'react-bootstrap';

// Define TypeScript types for our search results
type SearchResultItem = {
  id: number;
  type: string;
  // Add any additional fields your API returns
};

type SearchResultsData = {
  query: string;
  results: {
    [key: string]: SearchResultItem[];
  };
  total: number;
};

// Custom hook to get query parameters
const useQuery = () => new URLSearchParams(useLocation().search);

// Map API types to human-readable labels
const typeLabels: Record<string, string> = {
  user: 'Users',
  citem: 'Citems',
  title: 'Titles',
  badge: 'Badges',
};

const SearchResults = () => {
  const query = useQuery().get('q') || '';
  const [results, setResults] = useState<SearchResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
        
        if (!res.ok) {
          throw new Error(`Search failed: ${res.statusText}`);
        }

        const data: SearchResultsData = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small debounce to prevent rapid firing
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!query) {
    return (
      <div className="container mt-4">
        <Alert variant="info">Please enter a search term</Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Searching...</span>
        </Spinner>
        <p>Searching for "{query}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          <Alert.Heading>Search Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Search Results for "{query}"</h2>
      
      {results ? (
        <>
          <p className="text-muted mb-4">Found {results.total} results</p>
          
          {Object.keys(results.results).length === 0 ? (
            <Alert variant="warning">No results found for your search.</Alert>
          ) : (
            Object.entries(results.results).map(([type, items]) => (
              <Card key={type} className="mb-4">
                <Card.Header as="h5">
                  {typeLabels[type] || type} ({items.length})
                </Card.Header>
                <ListGroup variant="flush">
                  {items.map((item) => (
                    <ListGroup.Item key={`${type}-${item.id}`} action>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">ID: {item.id}</small>
                      </div>
                      {/* Add more item details here if needed */}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            ))
          )}
        </>
      ) : (
        <Alert variant="info">No search results to display</Alert>
      )}
    </div>
  );
};

export default SearchResults;