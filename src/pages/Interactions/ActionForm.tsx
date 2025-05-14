/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface ActionFormProps {
    item: any;
    onChange: (item: any) => void;
    onAddCommand: () => void;
    onRemoveCommand: (index: number) => void;
}

export const ActionForm = ({ item, onChange, onAddCommand, onRemoveCommand }: ActionFormProps) => {
    // Initialize commands state safely
    const [commands, setCommands] = useState<string[]>(() => {
        if (Array.isArray(item.commands)) {
            return [...item.commands];
        }
        if (typeof item.actions === 'string') {
            try {
                const parsed = JSON.parse(item.actions);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("Failed to parse actions:", e);
                return [];
            }
        }
        return [];
    });

    const [currentCommand, setCurrentCommand] = useState(item.currentCommand || '');

    // Update parent only when necessary
    useEffect(() => {
        onChange({
            ...item,
            commands,
            actions: JSON.stringify(commands),
            currentCommand
        });
    }, [commands, currentCommand]);

    const handleCommandChange = (index: number, newValue: string) => {
        const updatedCommands = [...commands];
        updatedCommands[index] = newValue;
        setCommands(updatedCommands);
    };

    const handleAddCommand = () => {
        const trimmedCommand = currentCommand.trim();
        if (trimmedCommand) {
            setCommands([...commands, trimmedCommand]);
            setCurrentCommand('');
            onAddCommand();
        }
    };

    const handleRemoveCommand = (index: number) => {
        const updatedCommands = commands.filter((_, i) => i !== index);
        setCommands(updatedCommands);
        onRemoveCommand(index);
    };

    return (
        <div className="form-group">
            <label>Behaviour</label>
            <select
                value={item.behaviour || 'break'}
                onChange={(e) => onChange({...item, behaviour: e.target.value})}
                className="form-control"
            >
                <option value="break">Break</option>
                <option value="continue">Continue</option>
            </select>

            <label>Match Type</label>
            <select
                value={item.matchtype || 'all'}
                onChange={(e) => onChange({...item, matchtype: e.target.value})}
                className="form-control"
            >
                <option value="all">All</option>
                <option value="one">One</option>
            </select>

            <label>Commands</label>
            <div style={{ display: 'flex', marginBottom: '1rem' }}>
                <input
                    type="text"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    className="form-control"
                    style={{ flex: 1, marginRight: '0.5rem' }}
                    placeholder="Enter command"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCommand()}
                />
                <button 
                    className="btn btn-primary"
                    onClick={handleAddCommand}
                    disabled={!currentCommand.trim()}
                >
                    Add
                </button>
            </div>

            {commands.length > 0 && (
                <div className="commands-list" style={{ 
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    {commands.map((cmd, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            backgroundColor: index % 2 === 0 ? 'var(--table-row-bg)' : 'var(--table-hover-bg)'
                        }}>
                            <input
                                type="text"
                                value={cmd}
                                onChange={(e) => handleCommandChange(index, e.target.value)}
                                className="form-control"
                                style={{ flex: 1, marginRight: '0.5rem' }}
                            />
                            <button 
                                className="action-btn"
                                onClick={() => handleRemoveCommand(index)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--danger-color)',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};