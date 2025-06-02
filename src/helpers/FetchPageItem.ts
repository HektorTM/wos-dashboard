export const fetchPageItem = async (type: string, id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${type}/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to fetch ${type}`);
      }
  
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  export const fetchType = async (type: string) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${type}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || `Failed to fetch ${type}`);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        throw err; 
    }
  };

  export const deletePageItem = async (type: string, id: string, uuid: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${type}/${id}?uuid=${uuid}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
      });
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to Delete ${type}`);
      }
  
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };