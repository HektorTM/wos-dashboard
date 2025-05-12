import { useEffect, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionFormProps {
    item: any;
    onChange: (item: any) => void;
    onAddCommand: () => void;
    onRemoveCommand: (index: number) => void;
}

export const ActionForm = ({ item, onChange, onAddCommand, onRemoveCommand }: ActionFormProps) => {
    // Safely initialize commands as an array
    const [commands, setCommands] = useState<string[]>(() => {
        // First try to use item.commands if it exists
        if (Array.isArray(item.commands)) {
          return [...item.commands];
        }
        // Then try to parse item.actions if it exists
        if (item.actions) {
          try {
            const parsed = JSON.parse(item.actions);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }
        // Default to empty array
        return [];
      });
    
      // Update parent when commands change
      useEffect(() => {
        onChange({
          ...item,
          commands,
          actions: JSON.stringify(commands)
        });
      }, [commands]);
    
      // Rest of your component remains the same...
      const handleCommandChange = (index: number, newValue: string) => {
        const updatedCommands = [...commands];
        updatedCommands[index] = newValue;
        setCommands(updatedCommands);
      };
    
      const handleAddCommand = () => {
        if (item.currentCommand?.trim()) {
          setCommands([...commands, item.currentCommand]);
          onChange({ ...item, currentCommand: '' });
        }
      };
    
      const handleRemoveCommand = (index: number) => {
        const updatedCommands = [...commands];
        updatedCommands.splice(index, 1);
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
                    value={item.currentCommand || ''}
                    onChange={(e) => onChange({...item, currentCommand: e.target.value})}
                    className="form-control"
                    style={{ flex: 1, marginRight: '0.5rem' }}
                    placeholder="Enter command"
                />
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        handleAddCommand();
                        onAddCommand();
                    }}
                    disabled={!item.currentCommand}
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
                                onClick={() => {
                                    handleRemoveCommand(index);
                                    onRemoveCommand(index);
                                }}
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