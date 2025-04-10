import { useState } from 'react';

const CreateCurrency = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [hiddenIfZero, setHiddenIfZero] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id,
      name,
      shortName,
      icon,
      color,
      hiddenIfZero,
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Currency created!');
        // Optional: clear form
        setId('');
        setName('');
        setShortName('');
        setIcon('');
        setColor('');
        setHiddenIfZero(false);
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
      <h3>Create a New Currency</h3>
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

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Short Name</label>
          <input
            type="text"
            className="form-control"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Icon (optional)</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Color</label>
          <input
            type="text"
            className="form-control form-control-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="hiddenIfZero"
            checked={hiddenIfZero}
            onChange={(e) => setHiddenIfZero(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="hiddenIfZero">
            Hidden if zero
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Currency'}
        </button>
      </form>
    </div>
  );
};

export default CreateCurrency;
