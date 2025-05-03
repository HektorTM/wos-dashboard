import { useEffect, useState } from 'react';
import { parseMinecraftColorCodes } from '../../utils/parser';
import EditButton from '../../components/EditButton';
import DeleteButton from '../../components/DeleteButton';

type Channel = {
  name: string;
  short_name: string;
  color: string;
  format: string;
  default_channel: boolean;
  autojoin: boolean;
  forcejoin: boolean;
  hidden: boolean;
  broadcastable: boolean;
  permission: string | null;
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
        
        if (!res.ok) throw new Error('Failed to fetch channels');
        
        const data = await res.json();
        
        // Convert MySQL tinyint(1) to boolean
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedChannels = data.map((channel: any) => ({
          ...channel,
          default_channel: Boolean(channel.default_channel),
          autojoin: Boolean(channel.autojoin),
          forcejoin: Boolean(channel.forcejoin),
          hidden: Boolean(channel.hidden),
          broadcastable: Boolean(channel.broadcastable),
          permission: channel.permission || null
        }));
        
        setChannels(formattedChannels);
      } catch (err) {
        console.error('Fetch channels error:', err);
        setError('Failed to load channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const deleteChannel = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete channel "${name}"?`)) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/channels/${name}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete channel');
      }
      
      setChannels(channels.filter((channel) => channel.name !== name));
    } catch (err) {
      console.error('Delete channel error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete channel');
    }
  };

  const filteredChannels = channels.filter((channel) =>
    [channel.name, channel.short_name, channel.format, channel.color, channel.permission]
      .some((field) => String(field || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Channel Management</h2>
        <div className="page-search">
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading channels...</p>
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
                <th>Default</th>
                <th>Autojoin</th>
                <th>Forcejoin</th>
                <th>Hidden</th>
                <th>Broadcast</th>
                <th>Permission</th>
                <th>Radius</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChannels.map((channel) => (
                <tr key={channel.name}>
                  <td>{channel.name}</td>
                  <td>{channel.short_name}</td>
                  <td style={{ color: channel.color }}>
                    {parseMinecraftColorCodes(channel.color)}
                  </td>
                  <td>{parseMinecraftColorCodes(channel.format)}</td>
                  <td>{channel.default_channel ? '✅' : '❌'}</td>
                  <td>{channel.autojoin ? '✅' : '❌'}</td>
                  <td>{channel.forcejoin ? '✅' : '❌'}</td>
                  <td>{channel.hidden ? '✅' : '❌'}</td>
                  <td>{channel.broadcastable ? '✅' : '❌'}</td>
                  <td>{channel.permission || '-'}</td>
                  <td>{channel.radius}</td>
                  <td className="actions-cell">
                    <EditButton 
                      perm="CHANNEL_EDIT" 
                      nav={`/view/channel/${channel.name}`} 
                    />
                    <DeleteButton 
                      perm="CHANNEL_DELETE" 
                      onClick={() => deleteChannel(channel.name)}
                    />
                  </td>
                </tr>
              ))}
              {filteredChannels.length === 0 && (
                <tr>
                  <td colSpan={12} className="no-results">
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