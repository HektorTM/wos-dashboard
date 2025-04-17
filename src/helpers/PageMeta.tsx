export const touchPageMeta = async (type: string, id: string, username: string) => {
    try {
      await fetch(`http://localhost:3001/api/page-data/${type}/${id}/touch?username=${username}`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to update last edited:', err);
    }
  };

export const createPageMeta = async (type: string, id: string, username: string) => {
  try {
    await fetch(`http://localhost:3001/api/page-data/${type}/${id}?username=${username}`, {
      method: 'POST',
      credentials: 'include',
    });
    
  } catch (err) {
    console.error('Failed to create Page Data:', err);
  }
};