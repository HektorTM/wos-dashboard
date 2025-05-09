import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/PageMetaBox';
import Modal from '../../components/Modal';

type InteractionTab = 'actions' | 'holograms' | 'particles' | 'blocks' | 'npcs';

interface Interaction {
  id: string;
  actions?: Action[];
  holograms?: Hologram[];
  particles?: Particle[];
  blocks?: string[];
  npcs?: string[];
}

interface Action {
  id: string;
  action_id: number;
  behaviour: string;
  matchtype: string;
  actions: string;
}

interface Hologram {
  interaction_id: string;
  hologram_id: number;
  behaviour: string;
  matchtype: string;
  hologram: string;
}

interface Particle {
  id: string;
  particle_id: string;
  behaviour: string;
  matchtype: string;
  particle: string;
}

const ViewInteraction = () => {
  const { authUser } = useAuth();
  const { id } = useParams();
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [activeTab, setActiveTab] = useState<InteractionTab>('actions');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentTab, setCurrentTab] = useState<InteractionTab>('actions');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [newItem, setNewItem] = useState<any>({});

  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/interactions/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setInteraction({
          ...data,
          blocks: data.blocks || [],
          npcs: data.npcs || []
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch interaction details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInteraction();
  }, [id]);

  const handleAddClick = (tab: InteractionTab) => {
    setCurrentTab(tab);
    setShowAddModal(true);
    setNewItem({});
  };

  const handleAddSubmit = async () => {
    try {
      let endpoint = '';
      let body = {};

      switch (currentTab) {
        case 'actions':
          endpoint = `http://localhost:3001/api/interactions/${id}/actions`;
          body = {
            behaviour: newItem.behaviour || 'default',
            matchtype: newItem.matchtype || 'default',
            actions: JSON.stringify(newItem.actions || [])
          };
          break;
        case 'holograms':
          endpoint = `http://localhost:3001/api/interactions/${id}/holograms`;
          body = {
            behaviour: newItem.behaviour || 'default',
            matchtype: newItem.matchtype || 'default',
            hologram: JSON.stringify(newItem.hologram || {})
          };
          break;
        case 'particles':
          endpoint = `http://localhost:3001/api/interactions/${id}/particles`;
          body = {
            behaviour: newItem.behaviour || 'default',
            matchtype: newItem.matchtype || 'default',
            particle: newItem.particle || 'default'
          };
          break;
        case 'blocks':
          endpoint = `http://localhost:3001/api/interactions/${id}/blocks`;
          body = {
            location: newItem.location || '0,0,0,world'
          };
          break;
        case 'npcs':
          endpoint = `http://localhost:3001/api/interactions/${id}/npcs`;
          body = {
            npc_id: newItem.npc_id || 'default_npc'
          };
          break;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updatedData = await fetch(`http://localhost:3001/api/interactions/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const updatedInteraction = await updatedData.json();
        setInteraction({
          ...updatedInteraction,
          blocks: updatedInteraction.blocks || [],
          npcs: updatedInteraction.npcs || []
        });
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to add new item');
    }
  };

  const renderAddForm = () => {
    switch (currentTab) {
      case 'actions':
        return (
          <div className="form-group">
            <label>Behaviour</label>
            <input
              type="text"
              value={newItem.behaviour || ''}
              onChange={(e) => setNewItem({...newItem, behaviour: e.target.value})}
              className="form-control"
            />
            <label>Match Type</label>
            <input
              type="text"
              value={newItem.matchtype || ''}
              onChange={(e) => setNewItem({...newItem, matchtype: e.target.value})}
              className="form-control"
            />
            <label>Actions (JSON)</label>
            <textarea
              value={newItem.actions || ''}
              onChange={(e) => setNewItem({...newItem, actions: e.target.value})}
              className="form-control"
              rows={3}
            />
          </div>
        );
      case 'holograms':
        return (
          <div className="form-group">
            <label>Behaviour</label>
            <input
              type="text"
              value={newItem.behaviour || ''}
              onChange={(e) => setNewItem({...newItem, behaviour: e.target.value})}
              className="form-control"
            />
            <label>Match Type</label>
            <input
              type="text"
              value={newItem.matchtype || ''}
              onChange={(e) => setNewItem({...newItem, matchtype: e.target.value})}
              className="form-control"
            />
            <label>Hologram (JSON)</label>
            <textarea
              value={newItem.hologram || ''}
              onChange={(e) => setNewItem({...newItem, hologram: e.target.value})}
              className="form-control"
              rows={3}
            />
          </div>
        );
      case 'particles':
        return (
          <div className="form-group">
            <label>Behaviour</label>
            <input
              type="text"
              value={newItem.behaviour || ''}
              onChange={(e) => setNewItem({...newItem, behaviour: e.target.value})}
              className="form-control"
            />
            <label>Match Type</label>
            <input
              type="text"
              value={newItem.matchtype || ''}
              onChange={(e) => setNewItem({...newItem, matchtype: e.target.value})}
              className="form-control"
            />
            <label>Particle</label>
            <input
              type="text"
              value={newItem.particle || ''}
              onChange={(e) => setNewItem({...newItem, particle: e.target.value})}
              className="form-control"
            />
          </div>
        );
      case 'blocks':
        return (
          <div className="form-group">
            <label>Location (x,y,z,world)</label>
            <input
              type="text"
              value={newItem.location || ''}
              onChange={(e) => setNewItem({...newItem, location: e.target.value})}
              className="form-control"
              placeholder="e.g., 100,64,200,world"
            />
          </div>
        );
      case 'npcs':
        return (
          <div className="form-group">
            <label>NPC ID</label>
            <input
              type="text"
              value={newItem.npc_id || ''}
              onChange={(e) => setNewItem({...newItem, npc_id: e.target.value})}
              className="form-control"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderTabHeader = (tab: InteractionTab, title: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h3>{title}</h3>
      <button 
        className="inter-create-button"
        onClick={() => handleAddClick(tab)}
        style={{ marginLeft: '1rem' }}
      >
        +
      </button>
    </div>
  );

  const renderTabContent = () => {
    if (!interaction) return null;

    switch (activeTab) {
      case 'actions':
        return (
          <div className="tab-content">
            {renderTabHeader('actions', 'Actions')}
            {interaction.actions?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Behaviour</th>
                      <th>Match Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.actions.map((action) => (
                      <tr key={action.action_id}>
                        <td>{action.action_id}</td>
                        <td>{action.behaviour}</td>
                        <td>{action.matchtype}</td>
                        <td>{action.actions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No actions configured</p>
            )}
          </div>
        );

      case 'holograms':
        return (
          <div className="tab-content">
            {renderTabHeader('holograms', 'Holograms')}
            {interaction.holograms?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Behaviour</th>
                      <th>Match Type</th>
                      <th>Hologram</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.holograms.map((hologram) => (
                      <tr key={hologram.hologram_id}>
                        <td>{hologram.hologram_id}</td>
                        <td>{hologram.behaviour}</td>
                        <td>{hologram.matchtype}</td>
                        <td>{hologram.hologram}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No holograms configured</p>
            )}
          </div>
        );

      case 'particles':
        return (
          <div className="tab-content">
            {renderTabHeader('particles', 'Particles')}
            {interaction.particles?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Behaviour</th>
                      <th>Match Type</th>
                      <th>Particle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.particles.map((particle) => (
                      <tr key={particle.particle_id}>
                        <td>{particle.particle_id}</td>
                        <td>{particle.behaviour}</td>
                        <td>{particle.matchtype}</td>
                        <td>{particle.particle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No particles configured</p>
            )}
          </div>
        );

      case 'blocks':
        return (
          <div className="tab-content">
            {renderTabHeader('blocks', 'Block Locations')}
            {interaction.blocks?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.blocks.map((block, index) => (
                      <tr key={index}>
                        <td>{block}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No block locations configured</p>
            )}
          </div>
        );

      case 'npcs':
        return (
          <div className="tab-content">
            {renderTabHeader('npcs', 'NPCs')}
            {interaction.npcs?.length ? (
              <div className="page-table-container">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>NPC ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.npcs.map((npc, index) => (
                      <tr key={index}>
                        <td>{npc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No NPCs configured</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`page-container ${theme}`}>
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading Interaction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`page-container ${theme}`}>
        <div className='error-message'>{error}</div>
      </div>
    );
  }

  return (
    <div className={`page-container ${theme}`}>


      <div className="content-wrapper" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div className="meta-box-wrapper" style={{ width: '350px' }}>
          <PageMetaBox type="interaction" id={id!} />
        </div>
        
        <div className="tabs-content-wrapper" style={{ flex: 1 }}>
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              Actions
            </button>
            <button
              className={`tab-button ${activeTab === 'holograms' ? 'active' : ''}`}
              onClick={() => setActiveTab('holograms')}
            >
              Holograms
            </button>
            <button
              className={`tab-button ${activeTab === 'particles' ? 'active' : ''}`}
              onClick={() => setActiveTab('particles')}
            >
              Particles
            </button>
            <button
              className={`tab-button ${activeTab === 'blocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('blocks')}
            >
              Block Locations
            </button>
            <button
              className={`tab-button ${activeTab === 'npcs' ? 'active' : ''}`}
              onClick={() => setActiveTab('npcs')}
            >
              NPCs
            </button>
          </div>

          {renderTabContent()}
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/interactions')}
        >
          Back to List
        </button>
      </div>

      <Modal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add New ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}`}
      >
        {renderAddForm()}
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleAddSubmit}
          >
            Add
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ViewInteraction;