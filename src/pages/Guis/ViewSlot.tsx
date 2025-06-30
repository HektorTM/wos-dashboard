/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';
import { createUnlockable, checkUnlockableExists } from '../../helpers/UnlockableFetcher';
import { useAuth } from '../../context/AuthContext';
import TitleComp from '../../components/TitleComponent';
import SlotForm from './SlotForm';
import ConditionList from '../../components/ConditionDataList';
import { noParamCond } from '../../components/NoParameterConditions';
import SlotMetaBox from '../../components/SlotMetaBox';
import { fetchLocked } from '../../helpers/PageMeta';

interface Condition {
  type: string;
  type_id: string;
  condition_id: number;
  condition_key: string;
  value: string;
  parameter: string;
}


interface Slot {
  id: string;
  slot: number;
  slot_id: number;
  matchtype: string;
  material: string;
  display_name: string;
  lore: string;
  custom_model_data: number | null;
  enchanted: boolean | null;
  right_click: string;
  left_click: string;
  visible: boolean | null;
  conditions: Condition[];
}

interface ApiResponse {
  slots: Slot[];
}

type RouteParams = {
  id: string;
  slotNumber: string;
}

const ViewSlot = () => {
  const { id, slotNumber } = useParams<keyof RouteParams>() as RouteParams;
  const slotNr = slotNumber;
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const { authUser } = useAuth();
  const [locked, setLocked] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<Slot>();

  // Condition Modal State
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [currentCondition, setCurrentCondition] = useState<Condition | null>(null);
  const [currentSlotId, setCurrentSlotId] = useState<number | null>(null);
  const [newCondition, setNewCondition] = useState<Omit<Condition, 'id'>>({
    type: 'guislot',
    type_id: `${id}`,
    condition_id: 0,
    condition_key: '',
    value: '',
    parameter: ''
  });

  const [unlockableExists, setUnlockableExists] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const fetchSlotData = async () => {
      try {
        setLoading(true);
        // Get all slot instances for this slot number
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/guis/${id}/slots/${slotNr}`,
          { method: 'GET', credentials: 'include' }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch slot data: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        
        // Data will be an array of all slot instances for this slot number
        const normalizedSlots = Array.isArray(data) 
          ? data.map(slot => ({
              ...slot,
              conditions: slot.conditions || []
            }))
          : [];

        setSlots(normalizedSlots);
        
        // Fetch conditions for each slot
        if (normalizedSlots.length > 0) {
          await Promise.all(normalizedSlots.map(async (slot) => {
            try {
              const condRes = await fetch(
                `${import.meta.env.VITE_API_URL}/api/conditions/guislot/${id}:${slotNr}:${slot.slot_id}`,
                { method: 'GET', credentials: 'include' }
              );
              const conditions = await condRes.json();
              
              setSlots(prev => prev.map(s => 
                s.slot_id === slot.slot_id 
                  ? { ...s, conditions: Array.isArray(conditions) ? conditions : [] }
                  : s
              ));
            } catch (err) {
              console.error(`Failed to fetch conditions for slot ${slot.slot_id}:`, err);
            }
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to fetch slot details');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlotData();
  }, [id, slotNr]);

  const fetchLockedValue = async () => {
    try {
      
      const result = await fetchLocked('gui', `${id}`);
      if (result == 1) {
        setLocked(true);
      } else {
        setLocked(false);
      }

    } catch (err) {
      console.error(err);
    }
  }
  fetchLockedValue();

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


  const handleMoveAction = async (actionId: number, direction: 'up' | 'down') => {
    if (isMoving) return;

    setIsMoving(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/interactions/${id}/actions/${actionId}/move?direction=${direction}`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      );

      if (!res.ok) throw new Error('Failed to move action');

      // Refresh interaction data
      const updatedRes = await fetch(`${import.meta.env.VITE_API_URL}/api/guis/${id}/slots/${slotNr}`, {
        method: 'GET',
        credentials: 'include',
      });
      const updatedGui = await updatedRes.json();
      setSlots({
        ...updatedGui,
      });
    } catch (err) {
      console.error('Error moving action:', err);
      setError('Failed to move action');
    } finally {
      setIsMoving(false);
    }
  };



  const handleAddClick = () => {
    
    setNewItem({ 
      slot: slotNumber ? slotNumber : slotNr,  // Make sure this is a valid number or string here
      matchtype: 'all',
      material: 'STONE',
      display_name: '',
      lore: JSON.stringify([]),
      custom_model_data: 0,
      enchanted: false,
      right_click: JSON.stringify([]),
      left_click: JSON.stringify([]),
      visible: false,
    });
    setModalMode('create');
    setShowModal(true);

  };

  const handleAddConditionClick = (type: string, slotId: number) => {
    setCurrentType(type);
    setCurrentSlotId(slotId);
    setCurrentCondition(null);
    setNewCondition({
      type: type,
      type_id: `${id}:${slotNr}:${slotId}`,
      condition_id: currentCondition?.condition_id ?? 0,
      condition_key: '',
      value: '',
      parameter: ''
    });
    setShowConditionModal(true);
  };

  const handleEditConditionClick = (type: string, slotId: number, condition: Condition) => {
    setCurrentType(type);
    setCurrentSlotId(slotId);
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
      if (!currentSlotId) return;

      const endpoint = currentCondition 
        ? `${import.meta.env.VITE_API_URL}/api/conditions/${currentType}/${id}:${slotNr}:${currentSlotId}/${currentCondition.condition_id}`
        : `${import.meta.env.VITE_API_URL}/api/conditions/${currentType}/${id}:${slotNr}:${currentSlotId}`;

      const method = currentCondition ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCondition)
      });

      if (res.ok) {
        // Get the updated condition list
        const condRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/conditions/guislot/${id}:${slotNr}:${currentSlotId}`,
          { method: 'GET', credentials: 'include' }
        );
        const updatedConditions = await condRes.json();

        // Update the existing slot with new conditions while preserving all other data
        setSlots(prevSlots => {
          return prevSlots.map(slot => {
            if (slot.slot_id === currentSlotId) {
              return {
                ...slot,
                conditions: Array.isArray(updatedConditions) ? updatedConditions : []
              };
            }
            return slot;
          });
        });

        setShowConditionModal(false);
      }
    } catch (err) {
      console.error('Failed to save condition:', err);
    }
  };


  const handleDeleteCondition = async (type: string, slotId: number, conditionId: number) => {
    if (!window.confirm('Are you sure you want to delete this condition?')) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conditions/${type}/${id}:${slotNr}:${slotId}/${conditionId}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (res.ok) {
        // Get the updated condition list
        const condRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/conditions/guislot/${id}:${slotNr}:${slotId}`,
          { method: 'GET', credentials: 'include' }
        );
        const updatedConditions = await condRes.json();

        // Update the state while preserving all other slot data
        setSlots(prevSlots => {
          return prevSlots.map(slot => {
            if (slot.slot_id === slotId) {
              return {
                ...slot,
                conditions: Array.isArray(updatedConditions) ? updatedConditions : []
              };
            }
            return slot;
          });
        });
      }
    } catch (err) {
      console.error('Failed to delete condition:', err);
    }
  };

  const handleEditClick = (item: any) => {
    setModalMode('edit');
    setCurrentItem(item);

    // If actions is already an array, no need to parse
    const commands = Array.isArray(item.actions)
      ? item.actions
      : typeof item.actions === 'string'
      ? (() => {
          try {
            return JSON.parse(item.actions);
          } catch (e) {
            console.error('Failed to parse actions:', e);
            return [];
          }
        })()
      : [];

    setNewItem({ 
      ...item,
      commands,
      currentCommand: '',
      lore: Array.isArray(item.lore) ? JSON.stringify(item.lore) : item.lore || "[]",
      right_click: Array.isArray(item.right_click) ? JSON.stringify(item.right_click) : item.right_click || "[]",
      left_click: Array.isArray(item.left_click) ? JSON.stringify(item.left_click) : item.left_click || "[]",

    });

    setShowModal(true);
  };

  const handleDelete = async (itemId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      let endpoint = '';
      let deleteEndpoint = '';
      const guiId = id;
      

      endpoint = `${import.meta.env.VITE_API_URL}/api/guis/${guiId}/slots/${slotNr}/${itemId}`;
      deleteEndpoint = `${import.meta.env.VITE_API_URL}/api/conditions/guislot/${guiId}:${slotNr}:${itemId}`; 

      

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
        const updatedData = await fetch(`${import.meta.env.VITE_API_URL}/api/guis/${id}/slots/${slotNr}`, {
          method: 'GET',
          credentials: 'include',
        });
        const updatedGui = await updatedData.json();
        if (Array.isArray(updatedGui)) {
          setSlots(updatedGui);
        } else if (updatedGui && Array.isArray(updatedGui.slots)) {
          setSlots(updatedGui.slots);
        } else {
          setSlots([]);
        }
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
    try {
      const endpoint = `${import.meta.env.VITE_API_URL}/api/guis/${id}/slots/${slotNr}`;
      const body = {
        matchtype: newItem?.matchtype || 'default',
        material: newItem?.material || 'STONE',
        display_name: newItem?.display_name || 'new Item',
        lore: JSON.parse(newItem?.lore || '[]'),
        custom_model_data: newItem?.custom_model_data || 0,
        enchanted: newItem?.enchanted ? 1 : 0,
        right_click: JSON.parse(newItem?.right_click || '[]'),
        left_click: JSON.parse(newItem?.left_click || '[]'),
        visible: newItem?.visible ? 1 : 0,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const newSlot = await res.json();
        setSlots(prev => [
          ...prev,
          {
            ...newSlot,
            conditions: newSlot.conditions || []
          }
        ]);
        setShowModal(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to add slot');
    }
  };


  const handleEditSubmit = async () => {
    try {
      const endpoint = `${import.meta.env.VITE_API_URL}/api/guis/${id}/slots/${slotNr}/${currentItem.slot_id}`;
      const body = {
        matchtype: newItem?.matchtype || 'default',
        material: newItem?.material || 'STONE',
        display_name: newItem?.display_name || 'new Item',
        lore: JSON.parse(newItem?.lore || '[]'),
        custom_model_data: newItem?.custom_model_data || 0,
        enchanted: newItem?.enchanted ? 1 : 0,
        right_click: JSON.parse(newItem?.right_click || '[]'),
        left_click: JSON.parse(newItem?.left_click || '[]'),
        visible: newItem?.visible ? 1 : 0,
      };

      const res = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updatedSlot = await res.json();
        setSlots(prev => prev.map(slot => 
          slot.slot_id === currentItem.slot_id
            ? { ...updatedSlot, conditions: slot.conditions }
            : slot
        ));
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update slot');
    }
  };

  const renderTabHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h3>Slot Configuration</h3>
      <button 
        className="inter-create-button"
        disabled={locked}
        onClick={() => handleAddClick()}
        style={{ marginLeft: '1rem' }}
      >
        +
      </button>
    </div>
  );


  const renderActionButtons = (item: any) => {
    let itemId: string | number = '';
    itemId = item.slot_id;


    return (
      <div style={{gap: '0.5rem' }}>
        <p 
          className="btn btn-sm btn-primary"
          onClick={() => handleEditClick(item)}
        >
          Edit
        </p>
        <p 
          className="btn btn-sm btn-danger"
          onClick={!locked ? () => handleDelete(itemId) : undefined}
        >
          Delete
        </p>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!slots) return null;
    if (error) return <div className="error-message">{error}</div>;
      return (
        <div className="tab-content">
          
          {renderTabHeader()}
          {slots.length > 0 ? (
            <div className="page-table-container">
              <table className="page-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Match Type</th>
                    <th>Conditions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={`slot-${slot.slot_id}`}>
                      <td>{slot.slot_id}
                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            disabled//={!interaction?.actions || index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveAction(slot.slot_id, 'up');
                            }}
                            style={{ 
                              padding: '2px 4px',
                              marginBottom: '2px',
                              fontSize: '12px',
                              lineHeight: '1'
                            }}
                          >
                            ↑
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            disabled//={!interaction?.actions || index === (interaction.actions.length  -1) }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveAction(slot.slot_id, 'down');
                            }}
                            style={{ 
                              padding: '2px 4px',
                              fontSize: '12px',
                              lineHeight: '1'
                            }}
                          >
                            ↓
                          </button>
                        </div>


                      </td>
                      <td>{slot.matchtype}</td>
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
                              {slot.conditions?.length ? (
                                slot.conditions.map((condition: Condition, index: any) => (
                                  <tr key={`condition-${slot.slot_id}-${index}`}>
                                    <td>{condition.condition_key}</td>
                                    <td>{condition.value}</td>
                                    <td>{condition.parameter}</td>
                                    <td>
                                      <div style={{gap: '0.5rem'}}>
                                        <p
                                          className='btn btn-sm btn-primary'
                                          onClick={!locked ? (e) => {
                                            e.stopPropagation();
                                            handleEditConditionClick("guislot", slot.slot_id, condition);
                                          }:undefined}
                                        >
                                        ✏️
                                        </p>
                                        <p 
                                          className="btn btn-sm btn-danger"
                                          onClick={!locked ? (e) => {
                                            e.stopPropagation();
                                            handleDeleteCondition("guislot", slot.slot_id, condition.condition_id);
                                          }:undefined}
                                        >
                                        🗑️
                                        </p>
                                        </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr key={`no-conditions-${slot.slot_id}`}>
                                  <td colSpan={4} className="no-conditions">No conditions</td>
                                </tr>
                              )}
                              <p
                                className='btn btn-sm btn-success'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddConditionClick("guislot",slot.slot_id);
                                }}
                                >
                                  Add Condition
                              </p>
                            </tbody>
                          </table>
                        </div>
                      </td>
                      <td>{renderActionButtons(slot)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No Slots configured</p>
          )}
        </div>
      );

      
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
      <TitleComp title={`Gui Slot | ${id}`}></TitleComp>
      <div className="content-wrapper" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div className="meta-box-wrapper" style={{ width: '350px' }}>
          <SlotMetaBox id={id} slot={slotNr}></SlotMetaBox>
        </div>
        
        <div className="tabs-content-wrapper" style={{ flex: 1 }}>
          {error && <div className="error-message">{error}</div>}
          {locked && (
            <div className="alert alert-warning page-input">
              This GUI is locked and cannot be edited.
            </div>
          )}
          {renderTabContent()}
        </div>
      </div>

      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${modalMode === 'create' ? 'Add New' : 'Edit'}`}
      >
        <SlotForm slot={{
          slot: newItem?.slot,
          material: newItem?.material,
          display_name: newItem?.display_name,
          lore: newItem?.lore,
          custom_model_data: newItem?.custom_model_data,
          enchanted: newItem?.enchanted,
          right_click: newItem?.right_click,
          left_click: newItem?.left_click,
          visible: newItem?.visible,
          matchtype: newItem?.matchtype

        }} onChange={setNewItem} onDisable={locked}></SlotForm>

        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            disabled={locked}
            onClick={() => handleModalSubmit()}
          >
            {currentCondition ? 'Update' : 'Add'}
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
          <ConditionList></ConditionList>
          
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
          {!noParamCond.includes(newCondition.condition_key) &&(
          <div>
            <label>Parameter</label>
            <input
              type="text"
              placeholder='e.g. Amount'
              value={newCondition.parameter}
              onChange={(e) => setNewCondition({...newCondition, parameter: e.target.value})}
              className="form-control"
            />
          </div>
          )}

        
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
        </div>
      </Modal>
    </div>
  );
};

export default ViewSlot;