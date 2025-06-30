import { useState, useEffect } from 'react';

interface SlotFormProps {
  slot: {
    slot?: number;
    material?: string;
    display_name?: string;
    lore?: string;
    custom_model_data?: number | null;
    enchanted?: boolean | null;
    right_click?: string;
    left_click?: string;
    visible?: boolean | null;
    matchtype?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (updatedSlot: any) => void;
  onDisable?: boolean;
}

const SlotForm = ({ slot, onChange, onDisable }: SlotFormProps) => {
  // State initialization
  const [localSlot, setLocalSlot] = useState(slot);
  const [loreText, setLoreText] = useState('');
  const [currentRightClickAction, setCurrentRightClickAction] = useState('');
  const [rightClickActions, setRightClickActions] = useState<string[]>([]);
  const [currentLeftClickAction, setCurrentLeftClickAction] = useState('');
  const [leftClickActions, setLeftClickActions] = useState<string[]>([]);

  // Initialize from slot prop
  useEffect(() => {
    setLocalSlot(slot);
    
    // Initialize lore
    if (slot.lore) {
      try {
        const parsed = JSON.parse(slot.lore);
        setLoreText(Array.isArray(parsed) ? parsed.join('\n') : slot.lore);
      } catch {
        setLoreText(slot.lore);
      }
    } else {
      setLoreText('');
    }
    
    // Initialize actions
    const parseActions = (actions?: string) => {
      if (!actions) return [];
      try {
        const parsed = JSON.parse(actions);
        return Array.isArray(parsed) ? parsed : [actions];
      } catch {
        return [actions];
      }
    };
    
    setRightClickActions(parseActions(slot.right_click));
    setLeftClickActions(parseActions(slot.left_click));
  }, []);

  // Update parent whenever relevant state changes
  useEffect(() => {
    const updatedSlot = {
      ...localSlot,
      lore: loreText ? JSON.stringify(loreText.split('\n')) : undefined,
      right_click: JSON.stringify(rightClickActions),
      left_click: JSON.stringify(leftClickActions)
    };
    onChange(updatedSlot);
  }, [localSlot, loreText, rightClickActions, leftClickActions, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setLocalSlot(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSlot(prev => ({
      ...prev,
      [name]: value === '' ? null : parseInt(value, 10)
    }));
  };

  // Action handlers
  const handleAddAction = (type: 'right' | 'left') => {
    const action = type === 'right' ? currentRightClickAction : currentLeftClickAction;
    if (!action.trim()) return;

    if (type === 'right') {
      setRightClickActions(prev => [...prev, action]);
      setCurrentRightClickAction('');
    } else {
      setLeftClickActions(prev => [...prev, action]);
      setCurrentLeftClickAction('');
    }
  };

  const handleRemoveAction = (type: 'right' | 'left', index: number) => {
    if (type === 'right') {
      setRightClickActions(prev => prev.filter((_, i) => i !== index));
    } else {
      setLeftClickActions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleActionChange = (type: 'right' | 'left', index: number, newValue: string) => {
        const updatedActions = type === 'right' ? [...rightClickActions]  : [...leftClickActions];
        updatedActions[index] = newValue;
        if (type === 'right') {
          setRightClickActions(updatedActions);
        } else {
          setLeftClickActions(updatedActions);
        }
    };

  const handleMoveAction = (type: 'right' | 'left', index: number, direction: 'up' | 'down') => {
    const actions = type === 'right' ? [...rightClickActions] : [...leftClickActions];
    
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === actions.length - 1)
    ) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [actions[index], actions[newIndex]] = [actions[newIndex], actions[index]];
    
    if (type === 'right') {
      setRightClickActions(actions);
    } else {
      setLeftClickActions(actions);
    }
  };

  const renderActionSection = (type: 'right' | 'left') => {
    const actions = type === 'right' ? rightClickActions : leftClickActions;
    const currentAction = type === 'right' ? currentRightClickAction : currentLeftClickAction;
    const setCurrentAction = type === 'right' ? setCurrentRightClickAction : setCurrentLeftClickAction;
    const label = type === 'right' ? 'Right Click Action' : 'Left Click Action';

    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="action-input-container">
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <input
                type="text"
                value={currentAction}
                onChange={(e) => setCurrentAction(e.target.value)}
                className="form-control"
                disabled={onDisable || false}
                style={{ flex: 1, marginRight: '0.5rem' }}
                placeholder="Enter command"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAction(type)}
            />
            <button 
                className="btn btn-primary"
                disabled={onDisable || false}
                onClick={() => handleAddAction(type)}
            >
                Add
            </button>
          </div>
        </div>
          
          {actions.length > 0 && (
                <div className="commands-list" style={{ 
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    {actions.map((cmd, index) => (
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
                                onChange={(e) => handleActionChange(type, index, e.target.value)}
                                disabled={onDisable || false}
                                className="form-control"
                                style={{ flex: 1, marginRight: '0.5rem' }}
                            />
                            <button 
                                className="action-btn"
                                onClick={() => handleRemoveAction(type, index)}
                                disabled={onDisable || false}
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


  return (
    <div className="slot-form row">
      {/* Left Column */}
      <div className="col-md-6">
        <div className="form-group">
          <label>Slot Number</label>
          <input
            type="number"
            name="slot"
            value={localSlot.slot || 0}
            onChange={handleInputChange}
            className="form-control"
            min="0"
            disabled
          />
        </div>

        <div className="form-group">
          <label>Material</label>
          <div className="input-group">
            <input
              name="material"
              value={localSlot.material}
              onChange={handleInputChange}
              className="form-control"
              disabled={onDisable || false}
            >
            </input>
            <div className="input-group-append">
              <span className="input-group-text">
                <img 
                  src={`https://mc.nerothe.com/img/1.21.4/minecraft_${(localSlot.material || 'STONE').toLowerCase()}.png`} 
                  alt={localSlot.material}
                  style={{ width: '24px', height: '24px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://mc.nerothe.com/img/1.21.4/minecraft_stone.png';
                  }}
                />
              </span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Display Name</label>
          <input
            type="text"
            name="display_name"
            value={localSlot.display_name || ''}
            onChange={handleInputChange}
            disabled={onDisable || false}
            className="form-control"
            placeholder="Item display name"
          />
        </div>

        <div className="form-group">
          <label>Lore</label>
          <textarea
            value={loreText}
            onChange={(e) => setLoreText(e.target.value)}
            className="form-control"
            disabled={onDisable || false}
            placeholder="Enter lore lines (one per line)"
            rows={4}
          />
          <small className="form-text text-muted">
            Enter one lore line per line
          </small>
        </div>

        <div className="form-group">
          <label>Custom Model Data</label>
          <input
            type="number"
            name="custom_model_data"
            value={localSlot.custom_model_data || ''}
            onChange={handleNumberInputChange}
            className="form-control"
            disabled={onDisable || false}
            placeholder="Leave empty for none"
            min="0"
          />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="enchanted"
            checked={localSlot.enchanted || false}
            onChange={handleInputChange}
            className="form-check-input"
            disabled={onDisable || false}
            id="enchantedCheck"
          />
          <label className="form-check-label" htmlFor="enchantedCheck">
            Enchanted
          </label>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-md-6">
        <div className="form-group">
          <label>Match Type</label>
          <select
            name="matchtype"
            value={localSlot.matchtype || 'all'}
            onChange={handleInputChange}
            disabled={onDisable || false}
            className="form-control"
          >
            <option value="all">All</option>
            <option value="one">One</option>
          </select>
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="visible"
            checked={localSlot.visible || false}
            onChange={handleInputChange}
            className="form-check-input"
            disabled={onDisable}
            id="visibilityCheck"
          />
          <label className="form-check-label" htmlFor="visibilityCheck">
            Vsibility
          </label>
        </div>

        {renderActionSection('right')}
        {renderActionSection('left')}
      </div>
    </div>
  );
};

export default SlotForm;