import { useEffect, useState } from 'react';
import { parseMinecraftColorCodes } from '../../utils/parser';
import EditButton from '../../components/EditButton';
import DeleteButton from '../../components/DeleteButton';

type Channel = {
  name: string;
  short_name: string;
  color: string;
  format: string;
  default_channel: number;
  custom_model_data: number;
  autojoin: number;
  forcejoin: number;
  hidden: number;
  broadcastable: number;
  permission: string;
  radius: number;
};

const ChannelTab = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/channels', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch Channels');
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load Channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const deleteChannel = async (name: string) => {
    if (!window.confirm('Are you sure you want to delete this Channel?')) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/channels/${name}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete');
      
      setChannels(channels.filter((channel) => channel.name !== name));
    } catch (err) {
      console.error(err);
      setError('Failed to delete Channel. Please try again.');
    }
  };

  const filteredChannels = channels.filter((c) =>
    [c.name, c.short_name, c.format, c.color, c.permission]
      .some((field) => String(field || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={'page-container §{theme}'}>
      <div className="page-header">
        <h2>Channel Management</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading citems...</p>
        </div>
      ) : (
        <div className="page-table-container">
          <table className="page-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Short Name</th>
                <th>Color</th>
                <th>Format</th>
                <th>Default Channel</th>
                <th>Autojoin</th>
                <th>Forcejoin</th>
                <th>Hidden</th>
                <th>Broadcastable</th>
                <th>Permission</th>
                <th>Radius</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChannels.map((channel) => (
                <tr key={channel.name}>
                  <td>{channel.name}</td>
                  <td className="text-cell">{channel.short_name}</td>
                  <td className="text-cell">{parseMinecraftColorCodes(channel.color)+channel.color}</td>
                  <td className="text-cell">{parseMinecraftColorCodes(channel.format)}</td>
                  <td className="boolean-cell">{channel.default_channel ? '✅' : '❌'}</td>
                  <td className='boolean-cell'>{channel.autojoin ? '✅' : '❌'}</td>
                  <td className="boolean-cell">{channel.forcejoin ? '✅' : '❌'}</td>
                  <td className="boolean-cell">{channel.hidden ? '✅' : '❌'}</td>
                  <td className="boolean-cell">{channel.broadcastable ? '✅' : '❌'}</td>
                  <td className="text-cell">{channel.permission}</td>
                  <td className="text-cell">{channel.radius}</td>
                  <td>
                    <EditButton perm='CHANNEL_EDIT' nav={`/view/channel/${channel.name}`} ></EditButton>
                    <DeleteButton perm='CHANNEL_DELETE' onClick={() => deleteChannel(channel.name)}></DeleteButton>
                  </td>
                </tr>
              ))}
              {filteredChannels.length === 0 && (
                <tr>
                  <td colSpan={14} className="no-results">
                    {search ? 'No matching channels found' : 'No channels available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChannelTab;