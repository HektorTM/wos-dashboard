/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PageMetaBox from '../../components/PageMetaBox';
import Modal from '../../components/Modal';
import { ActionForm } from './ActionForm';
import { createUnlockable, checkUnlockableExists } from '../../helpers/UnlockableFetcher';
import { useAuth } from '../../context/AuthContext';

type InteractionTab = 'actions' | 'holograms' | 'particles' | 'blocks' | 'npcs';

interface Condition {
  type: string;
  type_id: string;
  condition_id: number;
  condition_key: string;
  value: string;
  parameter: string;
}

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
  conditions?: Condition[];
}

interface Hologram {
  id: string;
  hologram_id: number;
  behaviour: string;
  matchtype: string;
  hologram: string;
}

interface Particle {
  id: string;
  particle_id: number;
  behaviour: string;
  matchtype: string;
  particle: string;
  particle_color: string;
  conditions?: Condition[];
}

const ViewInteraction = () => {
  const { id } = useParams();
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [activeTab, setActiveTab] = useState<InteractionTab>('actions');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const { authUser } = useAuth();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentTab, setCurrentTab] = useState<InteractionTab>('actions');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>({});

  // Condition Modal State
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [currentCondition, setCurrentCondition] = useState<Condition | null>(null);
  const [currentActionId, setCurrentActionId] = useState<number | null>(null);
  const [newCondition, setNewCondition] = useState<Omit<Condition, 'id'>>({
    type: 'interaction',
    type_id: `${id}`,
    condition_id: 0,
    condition_key: '',
    value: '',
    parameter: ''
  });

  const [unlockableExists, setUnlockableExists] = useState(true);

  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions/${id}`, {
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

  useEffect(() => {
    if(!interaction) return;
    if(interaction.actions?.length == 0) return;

    const fetchConditions = async () => {
      try {
        if (!interaction.actions) return;
        
        const conditionsPromises = interaction.actions.map(async (action) => {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/conditions/interaction/${id}:${action.action_id}`, 
            { method: 'GET', credentials: 'include' }
          );
          return res.json();
        });
    
        const conditionsResults = await Promise.all(conditionsPromises);
        
        setInteraction(prev => {
          if (!prev) return null;
          return {
            ...prev,
            actions: prev.actions?.map((action, index) => ({
              ...action,
              conditions: conditionsResults[index] || []
            }))
          };
        });
      } catch (err) {
        console.error('Failed to fetch conditions:', err);
      }
    };
    fetchConditions();
  }, [id, interaction]); // Added interaction to dependencies

  useEffect(() => {
    const checkUnlockableExistence = async () => {
      if (['has_unlockable', 'has_not_unlockable'].includes(newCondition.condition_key) && newCondition.value) {
        try {
          // Call your API checking function (make sure this exists)
          const { exists } = await checkUnlockableExists(newCondition.value);
          setUnlockableExists(exists);
        } catch (error) {
          console.error('Error checking unlockable:', error);
          setUnlockableExists(false);
        }
      }
    };

    const timeoutId = setTimeout(checkUnlockableExistence, 500);
    return () => clearTimeout(timeoutId);
  }, [newCondition.value, newCondition.condition_key]);


  const handleCreateUnlockable = async () => {
      await createUnlockable( newCondition.value, `${authUser?.uuid}` );
      setUnlockableExists(true);
    
  }
  

  useEffect(() => {
    if (!interaction) return;
    if (interaction.particles?.length === 0) return;

     const fetchParticleConditions = async () => {
      try {
        if (!interaction?.particles || interaction.particles.length === 0) return;
        
        const conditionsPromises = interaction.particles.map(async (particle) => {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/conditions/particle/${id}:${particle.particle_id}`, 
            { method: 'GET', credentials: 'include' }
          );
          return res.json();
        });
    
        const conditionsResults = await Promise.all(conditionsPromises);
        
        // Only update if conditions have changed
        const needsUpdate = interaction.particles.some((particle, index) => {
          const newConditions = conditionsResults[index] || [];
          return JSON.stringify(particle.conditions) !== JSON.stringify(newConditions);
        });
        
        if (needsUpdate) {
          setInteraction(prev => {
            if (!prev) return null;
            return {
              ...prev,
              particles: prev.particles?.map((particle, index) => ({
                ...particle,
                conditions: conditionsResults[index] || []
              }))
            };
          });
        }
      } catch (err) {
        console.error('Failed to fetch particle conditions:', err);
      }
    };
    
    fetchParticleConditions();
  }, [id, interaction?.particles]);

  const handleAddClick = (tab: InteractionTab) => {
    setCurrentTab(tab);
    setModalMode('create');
    setNewItem({ 
      commands: [],
      currentCommand: '',
      actions: [],
      behaviour: 'break',
      matchtype: 'all'
    });
    setShowModal(true);
  };

  const handleAddConditionClick = (type: string, actionId: number) => {
    setCurrentType(type);
    setCurrentActionId(actionId);
    setCurrentCondition(null);
    setNewCondition({
      type: type,
      type_id: `${id}:${actionId}`,
      condition_id: currentCondition?.condition_id ?? 0,
      condition_key: '',
      value: '',
      parameter: ''
    });
    setShowConditionModal(true);
  };

  const handleEditConditionClick = (type: string, actionId: number, condition: Condition) => {
    setCurrentType(type);
    setCurrentActionId(actionId);
    setCurrentCondition(condition);
    setNewCondition({
      type: type,
      type_id: condition.type_id,
      condition_id: condition.condition_id,
      condition_key: condition.condition_key,
      value: condition.value,
      parameter: condition.parameter
    });
    setShowConditionModal(true);
  };

  const handleConditionSubmit = async () => {
    try {
      if (!currentActionId) return;

      const endpoint = currentCondition 
        ? `${import.meta.env.VITE_API_URL}/api/conditions/${currentType}/${id}:${currentActionId}/${currentCondition.condition_id}`
        : `${import.meta.env.VITE_API_URL}/api/conditions/${currentType}/${id}:${currentActionId}`;

      const method = currentCondition ? 'PUT' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCondition)
      });

      if (res.ok) {
        // Refresh the conditions data
        const fetchConditions = async () => {
          const updatedData = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions/${id}`, {
            method: 'GET',
            credentials: 'include',
          });
          const updatedInteraction = await updatedData.json();
          setInteraction({
            ...updatedInteraction,
            blocks: updatedInteraction.blocks || [],
            npcs: updatedInteraction.npcs || []
          });
        };
        
        fetchConditions();
        setShowConditionModal(false);
      }
    } catch (err) {
      console.error('Failed to save condition:', err);
    }
  };

  const handleDeleteCondition = async (type: string, actionId: number, conditionId: number) => {
    if (!window.confirm('Are you sure you want to delete this condition?')) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conditions/${type}/${id}:${actionId}/${conditionId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (res.ok) {
        // Refresh the conditions data
        const updatedData = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const updatedInteraction = await updatedData.json();
        setInteraction({
          ...updatedInteraction,
          blocks: updatedInteraction.blocks || [],
          npcs: updatedInteraction.npcs || []
        });
      }
    } catch (err) {
      console.error('Failed to delete condition:', err);
    }
  };

  const handleEditClick = (tab: InteractionTab, item: any) => {
    setCurrentTab(tab);
    setModalMode('edit');
    setCurrentItem(item);
    
    // Parse the actions JSON string into commands
    let commands = [];
    try {
      commands = item.actions ? JSON.parse(item.actions) : [];
    } catch (e) {
      commands = [];
      console.error(e);
    }
  
    setNewItem({ 
      ...item,
      commands, // Add the parsed commands
      currentCommand: '' // Initialize currentCommand
    });
    setShowModal(true);
  };

  const handleAddCommand = () => {
    if (!newItem.currentCommand) return;
    
    setNewItem((prev: any) => ({
      ...prev,
      commands: [...(prev.commands || []), prev.currentCommand],
      currentCommand: '',
      actions: JSON.stringify([...(prev.commands || []), prev.currentCommand])
    }));
  };
  
  const handleRemoveCommand = (index: number) => {
    const updatedCommands = [...(newItem.commands || [])];
    updatedCommands.splice(index, 1);
    
    setNewItem((prev: any) => ({
      ...prev,
      commands: updatedCommands,
      actions: JSON.stringify(updatedCommands)
    }));
  };

  const handleDelete = async (tab: InteractionTab, itemId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      let endpoint = '';
      let deleteEndpoint = '';
      const interactionId = id;
      
      switch (tab) {
        case 'actions':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${interactionId}/actions/${itemId}`;
          deleteEndpoint = `${import.meta.env.VITE_API_URL}/api/conditions/interaction/${interactionId}:${itemId}`; 
          break;
        case 'holograms':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/holograms/${itemId}`;
          break;
        case 'particles':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/particles/${itemId}`;
          deleteEndpoint = `${import.meta.env.VITE_API_URL}/api/conditions/particles/${interactionId}:${itemId}`;
          break;
        case 'blocks':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/blocks/${encodeURIComponent(itemId as string)}`;
          break;
        case 'npcs':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/npcs/${encodeURIComponent(itemId as string)}`;
          break;
      }

      const res = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
      });

      const res2 = await fetch(deleteEndpoint, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok && res2.ok) {
        // Refresh the data
        const updatedData = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const updatedInteraction = await updatedData.json();
        setInteraction({
          ...updatedInteraction,
          blocks: updatedInteraction.blocks || [],
          npcs: updatedInteraction.npcs || []
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete item');
    }


  };

  const handleModalSubmit = async () => {
    try {
      if (modalMode === 'create') {
        await handleAddSubmit();
      } else {
        await handleEditSubmit();
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to ${modalMode} item`);
    }
  };

  const handleAddSubmit = async () => {
    let endpoint = '';
    let body = {};

    switch (currentTab) {
      case 'actions':
        endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/actions`;
        body = {
          behaviour: newItem.behaviour || 'default',
          matchtype: newItem.matchtype || 'default',
          actions: JSON.parse(newItem.actions || []) 
        };
        break;
      case 'holograms':
        endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/holograms`;
        body = {
          behaviour: newItem.behaviour || 'default',
          matchtype: newItem.matchtype || 'default',
          hologram: JSON.stringify(newItem.hologram || {})
        };
        break;
      case 'particles':
        endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/particles`;
        body = {
          behaviour: newItem.behaviour || 'default',
          matchtype: newItem.matchtype || 'default',
          particle: newItem.particle || 'default',
          particle_color: newItem.particle_color || ''
        };
        break;
      case 'blocks':
        endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/blocks`;
        body = {
          location: newItem.location || '0,0,0,world'
        };
        break;
      case 'npcs':
        endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/npcs`;
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
      const updatedData = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      const updatedInteraction = await updatedData.json();
      setInteraction({
        ...updatedInteraction,
        blocks: updatedInteraction.blocks || [],
        npcs: updatedInteraction.npcs || []
      });
      setShowModal(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      let endpoint = '';
      let body = {};

      switch (currentTab) {
        case 'actions':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/actions/${currentItem.action_id}`;
          body = {
            behaviour: newItem.behaviour,
            matchtype: newItem.matchtype,
            actions: JSON.parse(newItem.actions || [])
          };
          break;
        case 'holograms':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/holograms/${currentItem.hologram_id}`;
          body = {
            behaviour: newItem.behaviour || 'default',
            matchtype: newItem.matchtype || 'default',
            hologram: JSON.stringify(newItem.hologram || {})
          };
          break;
        case 'particles':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/particles/${currentItem.particle_id}`;
          body = {
            behaviour: newItem.behaviour || 'default',
            matchtype: newItem.matchtype || 'default',
            particle: newItem.particle || 'default',
            particle_color: newItem.particle_color || '',
          };
          break;
        case 'blocks':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/blocks/${encodeURIComponent(currentItem)}`;
          body = {
            location: newItem.location || '0,0,0,world'
          };
          break;
        case 'npcs':
          endpoint = `${import.meta.env.VITE_API_URL}/api/interactions/${id}/npcs/${encodeURIComponent(currentItem)}`;
          body = {
            npc_id: newItem.npc_id || 'default_npc'
          };
          break;
      }

      const res = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updatedData = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const updatedInteraction = await updatedData.json();
        setInteraction({
          ...updatedInteraction,
          blocks: updatedInteraction.blocks || [],
          npcs: updatedInteraction.npcs || []
        });
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update item');
    }
  };

  const renderModalForm = () => {
    switch (currentTab) {
      case 'actions':
        return (
          <ActionForm 
            item={newItem}
            onChange={setNewItem}
            onAddCommand={handleAddCommand}
            onRemoveCommand={handleRemoveCommand}
          />
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
              required
              value={newItem.particle || ''}
              onChange={(e) => setNewItem({...newItem, particle: e.target.value})}
              className="form-control"
            />

            <label>Color</label>
            <input
              type="color"
              value={newItem.particle_color || ''}
              onChange={(e) => setNewItem({...newItem, particle_color: e.target.value})}
              className='form-control'
            ></input>
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


  const renderActionButtons = (tab: InteractionTab, item: any) => {
    let itemId: string | number = '';
    
    switch (tab) {
      case 'actions':
        itemId = item.action_id;
        break;
      case 'holograms':
        itemId = item.hologram_id;
        break;
      case 'particles':
        itemId = item.particle_id;
        break;
      case 'blocks':
        itemId = item;
        break;
      case 'npcs':
        itemId = item;
        break;
    }

    return (
      <div style={{gap: '0.5rem' }}>
        <p 
          className="btn btn-sm btn-primary"
          onClick={() => handleEditClick(tab, item)}
        >
          Edit
        </p>
        <p 
          className="btn btn-sm btn-danger"
          onClick={() => handleDelete(tab, itemId)}
        >
          Delete
        </p>
      </div>
    );
  };

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
                      <th>Conditions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.actions.map((action) => (
                      <tr key={action.action_id}>
                        <td>{action.action_id}</td>
                        <td>{action.behaviour}</td>
                        <td>{action.matchtype}</td>
                        <td>
                          <div className="condition-container">
                            <table className="condition-table">
                              <thead>
                                <tr>
                                  <th>Key</th>
                                  <th>Value</th>
                                  <th>Parameter</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {action.conditions?.length ? (
                                  action.conditions.map((condition, index) => (
                                    <tr key={`${action.action_id}-${index}`}>
                                      <td>{condition.condition_key}</td>
                                      <td>{condition.value}</td>
                                      <td>{condition.parameter}</td>
                                      <td>
                                        <div style={{gap: '0.5rem'}}>
                                          <p
                                            className='btn btn-sm btn-primary'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditConditionClick("interaction", action.action_id, condition);
                                            }}
                                          >
                                          ✏️
                                          </p>
                                          <p 
                                            className="btn btn-sm btn-danger"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCondition("interaction", action.action_id, condition.condition_id);
                                            }}
                                          >
                                          🗑️
                                          </p>
                                         </div>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="no-conditions">No conditions</td>
                                  </tr>
                                )}
                                <p
                                  className='btn btn-sm btn-success'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddConditionClick("interaction",action.action_id);
                                  }}
                                  >
                                    Add Condition
                                </p>
                              </tbody>
                            </table>
                          </div>
                        </td>
                        <td>{renderActionButtons('actions', action)}</td>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.holograms.map((hologram) => (
                      <tr key={hologram.hologram_id}>
                        <td>{hologram.hologram_id}</td>
                        <td>{hologram.behaviour}</td>
                        <td>{hologram.matchtype}</td>
                        <td>{hologram.hologram}</td>
                        <td>{renderActionButtons('holograms', hologram)}</td>
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
                      <th>Conditions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.particles.map((particle) => (
                      <tr key={particle.particle_id}>
                        <td>{particle.particle_id}</td>
                        <td>{particle.behaviour}</td>
                        <td>{particle.matchtype}</td>
                        <td>{particle.particle}</td>
                        <td>
                          <div className="condition-container">
                            <table className="condition-table">
                              <thead>
                                <tr>
                                  <th>Key</th>
                                  <th>Value</th>
                                  <th>Parameter</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {particle.conditions?.length ? (
                                  particle.conditions.map((condition, index) => (
                                    <tr key={`${particle.particle_id}-${index}`}>
                                      <td>{condition.condition_key}</td>
                                      <td>{condition.value}</td>
                                      <td>{condition.parameter}</td>
                                      <td>
                                        <div style={{gap: '0.5rem'}}>
                                          <p
                                            className='btn btn-sm btn-primary'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditConditionClick("particle", particle.particle_id, condition);
                                            }}
                                          >
                                          ✏️
                                          </p>
                                          <p 
                                            className="btn btn-sm btn-danger"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCondition("particle", particle.particle_id, condition.condition_id);
                                            }}
                                          >
                                          🗑️
                                          </p>
                                         </div>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="no-conditions">No conditions</td>
                                  </tr>
                                )}
                                <p
                                  className='btn btn-sm btn-success'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddConditionClick("particle", particle.particle_id);
                                  }}
                                  >
                                    Add Condition
                                </p>
                              </tbody>
                            </table>
                          </div>
                        </td>
                        <td>{renderActionButtons('particles', particle)}</td>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.blocks.map((block, index) => (
                      <tr key={index}>
                        <td>{`${block}`}</td>
                        <td>{renderActionButtons('blocks', block)}</td>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interaction.npcs.map((npc, index) => (
                      <tr key={index}>
                        <td>{npc}</td>
                        <td>{renderActionButtons('npcs', npc)}</td>
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

      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${modalMode === 'create' ? 'Add New' : 'Edit'} ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}`}
      >
        {renderModalForm()}
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleModalSubmit}
          >
            {modalMode === 'create' ? 'Add' : 'Save'}
          </button>
        </div>
      </Modal>

      {/* Condition Modal */}
      <Modal 
        isOpen={showConditionModal}
        onClose={() => setShowConditionModal(false)}
        title={`${currentCondition ? 'Edit' : 'Add'} Condition`}
      >
        <div className="form-group">
          <label>Key</label>
          <input
            placeholder='Select'
            list='condition_keys'
            value={newCondition.condition_key}
            onChange={(e) => setNewCondition({...newCondition, condition_key: e.target.value})}
            className="form-control"
          />
          <datalist id="condition_keys">
            <option value="has_citem"></option>
            <option value="has_not_citem"></option>
            <option value="has_unlockable"></option>
            <option value="has_not_unlockable"></option>
            <option value="has_stats"></option>
            <option value="has_not_stats"></option>
            <option value="is_in_region"></option>
            <option value="is_not_in_region"></option>
          </datalist>
          
          <label>Value</label>
          <input
            type="text"
            placeholder='Identifier'
            value={newCondition.value}
            onChange={(e) => setNewCondition({...newCondition, value: e.target.value})}
            className="form-control"
          />
          
          {!unlockableExists && newCondition.value != "" && ['has_unlockable', 'has_not_unlockable'].includes(newCondition.condition_key) && (
            <div className="mt-2">
              <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleCreateUnlockable()}
              >
                Create Unlockable: "{newCondition.value}"
              </button>
            </div>
          )} 

          <label>Parameter</label>
          <input
            type="text"
            placeholder='e.g. Amount'
            value={newCondition.parameter}
            onChange={(e) => setNewCondition({...newCondition, parameter: e.target.value})}
            className="form-control"
          />
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowConditionModal(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleConditionSubmit}
          >
            {currentCondition ? 'Update' : 'Add'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ViewInteraction;