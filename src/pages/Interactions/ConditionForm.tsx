/* eslint-disable @typescript-eslint/no-explicit-any */
interface ConditionFormProps {
    item: any;
    onChange: (item: any) => void;
    onAddCommand: () => void;
    onRemoveCommand: (index: number) => void;
  }
  
  export const ConditionForm = ({ item, onChange, onAddCommand, onRemoveCommand }: ConditionFormProps) => {
    return (
      <div className="form-group">
        <label>Condition Key</label>
        <select
          value={item.behaviour || 'break'}
          onChange={(e) => onChange({...item, behaviour: e.target.value})}
          className="form-control"
        >
          <option value="break">Break</option>
          <option value="continue">Continue</option>
        </select>
  
        <label>Value</label>
        <select
          value={item.matchtype || 'all'}
          onChange={(e) => onChange({...item, matchtype: e.target.value})}
          className="form-control"
        >
          <option value="all">All</option>
          <option value="one">One</option>
        </select>
  
        <label>Parameter</label>
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <input
            type="text"
            value={item.currentCommand || ''}
            onChange={(e) => onChange({...item, currentCommand: e.target.value})}
            className="form-control"
            style={{ flex: 1, marginRight: '0.5rem' }}
            placeholder="Enter command"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && item.currentCommand) {
                onAddCommand();
              }
            }}
          />
          <button 
            className="btn btn-primary"
            onClick={onAddCommand}
            disabled={!item.currentCommand}
          >
            Add
          </button>
        </div>
  
        {item.commands?.length > 0 && (
          <div className="commands-list" style={{ 
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '0.5rem',
            marginBottom: '1rem'
          }}>
            {item.commands.map((cmd: string, index: number) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: index % 2 === 0 ? 'var(--table-row-bg)' : 'var(--table-hover-bg)'
              }}>
                <span>{cmd}</span>
                <button 
                  className="action-btn"
                  onClick={() => onRemoveCommand(index)}
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