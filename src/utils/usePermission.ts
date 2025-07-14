// hooks/usePermission.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PermissionKey } from './permissions.ts';

export const usePermission = () => {
  const { authUser } = useAuth();
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authUser?.uuid) return;

    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/users/permissions/${authUser?.uuid}`, {method: 'GET', credentials: 'include'})
      .then((res) => res.json())
      .then((data) => {
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch permissions', err);
        setPermissions([]);
        setLoading(false);
      });
  }, [authUser?.uuid]);

  const hasPermission = (key: PermissionKey) => {
    return permissions.includes(key);
  };

  return { hasPermission, loading };
};
