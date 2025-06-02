import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Recipe = {
  id: string;
  type: 'shaped' | 'unshaped';
  input: string[];  // 9 elements max
  output: string;
  success: string;
};

type CreateRecipePopupProps = {
  onClose: () => void;
  onCreate: (newRecipe: Recipe) => void;
};

const CreateRecipePopup = ({ onClose, onCreate }: CreateRecipePopupProps) => {
  const { authUser } = useAuth();
  const { theme } = useTheme();

  const [type, setType] = useState<'shaped' | 'unshaped'>('shaped');
  const [inputs, setInputs] = useState<string[]>(Array(9).fill(''));
  const [output, setOutput] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      type,
      id: Date.now().toString(), // or generate via UUID
      input: inputs,
      output,
      success,
      uuid: authUser?.uuid,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        onCreate(payload);
        onClose();
      } else {
        setError(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${theme}`}>
        <div className="modal-header">
          <h3>Create Recipe</h3>
          <button onClick={onClose} className="modal-close" disabled={loading}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <div className="btn-group" role="group">
              {['shaped', 'unshaped'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`btn btn-outline-primary ${type === opt ? 'active' : ''}`}
                  onClick={() => setType(opt as 'shaped' | 'unshaped')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Ingredients</label>
            <div className="grid grid-cols-3 gap-2">
              {inputs.map((value, i) => (
                <input
                  key={i}
                  type="text"
                  className="recipe-cell"
                  placeholder={`ID ${i + 1}`}
                  value={value}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Output ID</label>
            <input
              type="text"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Success ID</label>
            <input
              type="text"
              value={success}
              onChange={(e) => setSuccess(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className='spinner'></span> Creating...</> : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipePopup;
