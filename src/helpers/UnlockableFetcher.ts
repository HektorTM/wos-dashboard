export const createUnlockable = async ( id: string, uuid: string ) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/unlockables`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        temp: false,
        uuid: uuid,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create unlockable');
    }

    return { success: true, message: 'Unlockable created successfully' };
  } catch (err) {
    console.error('Error creating unlockable:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error occurred' };
  }
};

export const checkUnlockableExists = async (id: string): Promise<{ exists: boolean}> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/unlockables/exists/${id}`,{
    method: 'GET',
    credentials: 'include'
  });
  return res.json();
};