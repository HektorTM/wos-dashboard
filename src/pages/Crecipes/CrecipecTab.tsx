import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DeleteButton from '../../components/buttons/DeleteButton.tsx';
import EditButton from '../../components/buttons/EditButton.tsx';
import { deletePageItem, fetchType } from '../../helpers/FetchPageItem';
import { deletePageMeta } from '../../helpers/PageMeta';
import CreateCosmeticPopup from './CreateCrecipePopUp';
import TitleComp from '../../components/TitleComponent';

type Recipe = {
  id: string;
  type: string;
  output: string;
  success: string;
};

const RecipeTab = () => {
  const { theme } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authUser } = useAuth();

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await fetchType('crecipes');
        setRecipes(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load recipes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleRecipeCreated = (newRecipe: Recipe) => {
    setRecipes([...recipes, newRecipe]);
  }

  const deleteRecipe = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Recipe?')) return;

    try {
      deletePageItem('recipes', `${id}`, `${authUser?.uuid}`);
      deletePageMeta('recipe', `${id}`, `${authUser?.uuid}`);
      setRecipes(recipes.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete recipe. Please try again.');
    }
  };

  const filteredRecipes = recipes.filter((c) =>
    [c.type, c.id, c.output].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Recipes | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Recipes</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID, name, short name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Recipe
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading recipes...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Type</th>
                <th style={{padding: '4px 8px'}}>Output</th>
                <th style={{padding: '4px 8px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((recipe) => (
                <tr key={recipe.id} style={{height: '32px'}}>
                  <td style={{padding: '4px 8px'}}>{recipe.id}</td>
                  <td style={{padding: '4px 8px'}}>{recipe.type}</td>
                  <td style={{padding: '4px 8px'}}>{recipe.output}</td>
                  <td style={{padding: '4px 8px'}}>
                    <EditButton perm='RECIPE_EDIT' nav={`/view/recipe/${recipe.id}`} ></EditButton>
                    <DeleteButton perm='RECIPE_DELETE' onClick={() => deleteRecipe(recipe.id)}></DeleteButton>
                  </td>
                </tr>
              ))}
              {filteredRecipes.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching recipes found' : 'No recipes available'}
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
          onCreate={handleRecipeCreated}
        />
      )}

    </div>
  );
};

export default RecipeTab;
