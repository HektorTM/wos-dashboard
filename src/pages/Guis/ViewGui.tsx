import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TitleComp from '../../components/TitleComponent';
import GuiMetaBox from '../../components/metaboxes/GuiMetaBox.tsx';
import { parseMinecraftColorCodes } from '../../utils/parser';
import { fetchLocked } from '../../helpers/PageMeta';

interface Gui {
  id: string;
  size: number;
  title: string;
  open_actions: string[];
  close_actions: string[];
}

interface Slot {
  gui_id: string;
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
  visible: number;
}

interface ApiResponse {
  gui: Gui[];
  slots: Slot[];
}

const ViewGui = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  

  useEffect(() => {
    const fetchGuiData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/guis/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch GUI data');
        
        const responseData = await res.json();
        
        // Ensure the data structure is correct
        if (!responseData.gui || !Array.isArray(responseData.gui)) {
          throw new Error('Invalid GUI data structure');
        }
        
        setData({
          gui: responseData.gui,
          slots: Array.isArray(responseData.slots) ? responseData.slots : []
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to fetch GUI details');
      } finally {
        setLoading(false);
      }
    };

    fetchGuiData();
  }, [id]);

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

  const handleSlotClick = (slotNumber: number) => {
    if (!data) return;
    
    // Always navigate, regardless of whether the slot is occupied
    navigate(`/view/gui/${id}/${slotNumber}`);
  };

  const renderGrid = () => {
    if (!data || !data.gui || data.gui.length === 0) return null;

    const gui = data.gui[0];
    const columns = 9;
    const rows = gui.size;
    const totalSlots = rows * columns;

    const occupiedSlots = new Set<number>();
    data.slots.forEach(slot => {
      occupiedSlots.add(slot.slot);
    });

    return (
      <div className="gui-grid-container">
        <h3 style={{ color: '#333', marginBottom: '20px' }}>
          {parseMinecraftColorCodes(gui.title)}
        </h3>
        <div 
          className="gui-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 60px)`,
            gridTemplateRows: `repeat(${rows}, 60px)`,
            gap: '5px',
          }}
        >
          {Array.from({ length: totalSlots }).map((_, index) => {
            const slotNumber = index;
            const isOccupied = occupiedSlots.has(slotNumber);
            const slotItems = data.slots.filter(s => s.slot === slotNumber);
            const firstItem = isOccupied ? slotItems[0] : null;

            return (
              <div
                key={slotNumber}
                className={`gui-slot ${isOccupied ? 'has-items' : ''}`}
                onClick={() => handleSlotClick(slotNumber)}
                style={{
                  border: `2px solid ${isOccupied ? '#646cff' : '#ddd'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: isOccupied ? '#f0f0ff' : '#f9f9f9',
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '60px',
                  height: '60px',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  fontSize: '10px',
                  color: isOccupied ? '#646cff' : '#999',
                  fontWeight: 'bold',
                }}>
                  {slotNumber}
                </div>
                
                {isOccupied ? (
                  <>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {/* Image container with proper sizing */}
                      <div style={{
                        width: '48px',  // Slightly smaller than slot
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <img
                          src={`https://mc.nerothe.com/img/1.21.4/minecraft_${firstItem?.material.replace('minecraft:', '').toLowerCase()}.png`}
                          alt={firstItem?.display_name?.replace(/§[0-9a-fk-or]/g, '')}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      
                      {/* Item name (only show if there's space) */}
                      {firstItem?.display_name && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          color: 'black',
                          left: '0',
                          right: '0',
                          textAlign: 'center',
                          fontSize: '9px',
                          lineHeight: '1.1',
                          padding: '0 2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                        }}>
                          {firstItem.display_name.replace(/§[0-9a-fk-or]/g, '')}
                        </div>
                      )}
                    </div>

                    {/* Multiple items indicator */}
                    {slotItems.length > 1 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        backgroundColor: '#646cff',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                      }}>
                        {slotItems.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#999',
                  }}>
                    Empty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`GUI | ${id}`} />
      <div
        className="form-meta-container"
        style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}
      >
        {data?.gui?.[0] && <GuiMetaBox id={id!} gui={data.gui[0]} />}
        <div style={{ flex: 3 }}>
          {error && <div className="error-message">{error}</div>}
          {locked && (
            <div className="alert alert-warning page-input">
              This GUI is locked and cannot be edited.
            </div>
          )}
          {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading GUI...</div>}
          {data && renderGrid()}
        </div>
      </div>
    </div>
  );
};

export default ViewGui;