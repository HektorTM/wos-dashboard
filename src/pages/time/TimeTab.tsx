import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchType } from '../../helpers/FetchPageItem';
import CreateTimePopUp from './CreateTimePopUp.tsx';
import TitleComp from '../../components/TitleComponent';
import {usePermission} from "../../utils/usePermission.ts";
import {useNavigate} from "react-router-dom";
import {parseMinecraftColorCodes} from "../../utils/parser.tsx";

type TimeEvent = {
  id: string;
  name: string;
  message: string;
  isDefault: boolean;
  date: string;
  start_time: number;
  end_time: number;
  start_interaction: string;
  end_interaction: string;
};

const TimeTab = () => {
  const { theme } = useTheme();
  const [timeevents, setTimeevents] = useState<TimeEvent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  useEffect(() => {
    const fetchTimeEvents = async () => {
      try {
        const data = await fetchType('timeevents');
        setTimeevents(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load Time Events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEvents();
  }, []);

  const handleClick = (id:string) => {
    if (hasPermission('TIME_EDIT')) {
      navigate(`/view/timeevent/${id}`);
    } else {
      return;
    }
  };

  const handleTimeEventCreated = (newTimeevent: TimeEvent) => {
    setTimeevents([...timeevents, newTimeevent]);
  }

  const filteredTimeevents = timeevents.filter((c) =>
    [c.id, c.name, c.date].some((field) =>
      String(field || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`page-container ${theme}`}>
      <TitleComp title={`Time Events | Staff Portal`}></TitleComp>
      <div className="page-header">
        <h2>Time Events</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search by ID, name, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        {hasPermission('TIME_CREATE') && (
        <button 
          onClick={() => setShowCreatePopup(true)} 
          className="create-button"
        >
          + Create Time Event
        </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Time Events...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr style={{height: '32px'}}>
                <th style={{padding: '4px 8px'}}>ID</th>
                <th style={{padding: '4px 8px'}}>Name</th>
                <th style={{padding: '4px 8px'}}>Date</th>
                <th style={{padding: '4px 8px'}}>Start Time</th>
                <th style={{padding: '4px 8px'}}>End Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimeevents.map((timeevent) => (
                <tr key={timeevent.id} style={{height: '32px'}} onClick={() => handleClick(timeevent.id)}>
                  <td style={{padding: '4px 8px'}}>{timeevent.id}</td>
                  <td style={{padding: '4px 8px'}}>{parseMinecraftColorCodes(`${timeevent.name}`)}</td>
                  <td style={{padding: '4px 8px'}}>{timeevent.date}</td>
                  <td style={{padding: '4px 8px'}}>{timeevent.start_time}</td>
                  <td style={{padding: '4px 8px'}}>{timeevent.end_time}</td>
                </tr>
              ))}
              {filteredTimeevents.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results">
                    {search ? 'No matching Time Events found' : 'No Time Events available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreatePopup && (
        <CreateTimePopUp
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleTimeEventCreated}
        />
      )}

    </div>
  );
};

export default TimeTab;
