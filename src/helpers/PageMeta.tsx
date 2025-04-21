export const touchPageMeta = async (type: string, id: string, uuid: string) => {
    try {
      await fetch(`http://localhost:3001/api/page-data/${type}/${id}/touch?uuid=${uuid}`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to update last edited:', err);
    }
  };

export const createPageMeta = async (type: string, id: string, uuid: string) => {
  try {
    await fetch(`http://localhost:3001/api/page-data/${type}/${id}?uuid=${uuid}`, {
      method: 'POST',
      credentials: 'include',
    });
    
  } catch (err) {
    console.error('Failed to create Page Data:', err);
  }
};

export const fetchLocked = async (type: string, id: string) => {
  try {
    const res = await fetch(`http://localhost:3001/api/page-data/${type}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to fetch page data');

    const data = await res.json();
    return data.locked;

  } catch (err) {
    console.error('Failed to get Page Data:', err);
    throw err;
  }
}

export const deletePageMeta = async (type: string, id: string, uuid: string) => {
  try {
    await fetch(`http://localhost:3001/api/page-data/${type}/${id}?uuid=${uuid}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Failed to delete Page Data:', err);
  }
}