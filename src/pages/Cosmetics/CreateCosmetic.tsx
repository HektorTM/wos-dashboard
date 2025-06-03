import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createPageMeta } from '../../helpers/PageMeta';
import { parseID } from '../../utils/parser';

const CreateCosmetic = () => {
    const { authUser } = useAuth();
    const [error, setError] = useState('');
    const [type, setType] = useState('');
    const [id, setId] = useState('');
    const [display, setDisplay] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const Navigate = useNavigate();
    const { theme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            type,
            id: parseID(id),
            display,
            description,
            uuid: authUser?.uuid,
        };

        try {
            setLoading(true);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cosmetics/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });


            const result = await res.json();
            if (res.ok) {
                createPageMeta(`cosmetic`, `${parseID(id)}`, `${authUser?.uuid}`)

                alert('Cosmetic created!');
                // Optional: clear form
                setType('');
                setId('');
                setDisplay('');
                setDescription('');
                Navigate('/cosmetics');
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
        <div className={`page-container ${theme}`}>
            <h2>Create a New Cosmetic</h2>
            {error && <div className='error-message'>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group page-input">
                    <label>Type</label>
                    <div className="btn-group" role="group" aria-label="Type selection">
                        {["title", "badge", "prefix"].map((typeOption) => (
                            <button
                                key={typeOption}
                                type="button"
                                className={`btn btn-outline-primary ${type === typeOption ? "active" : ""}`}
                                onClick={() => setType(typeOption)}
                            >
                                {typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                
                <div className="form-group page-input">
                    <label>ID</label>
                    <input
                        type="text"
                        className="form-control"
                        value={id}
                        onChange={(e) => setId(parseID(e.target.value))}
                        required
                    />
                </div>


                <div className="form-group page-input">
                    <label>
                        {type === 'title' && 'Display'}
                        {type === 'badge' && 'Display'}
                        {type === '' && 'Display'}
                        {type === 'prefix' && 'Prefix'}
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        value={display}
                        onChange={(e) => setDisplay(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group page-input">
                    <label>Description</label>
                    <input
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className='spinner'></span> Creating...
                        </>
                    ) : (
                        'Create Cosmetic'
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateCosmetic;
