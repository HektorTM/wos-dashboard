import { useState } from 'react';

const CreateUnlockable = () => {
  const [id, setId] = useState('');
  const [temp, setTemp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id,
      temp,
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/unlockables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Unlockable created!');
        // Optional: clear form
        setId('');
        setTemp(false);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <h3>Create a New Unlockable</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">ID</label>
          <input
            type="text"
            className="form-control"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="temp"
            checked={temp}
            onChange={(e) => setTemp(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="temp">
            Temporary
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Unlockable'}
        </button>
      </form>
    </div>
  );
};

export default CreateUnlockable;
