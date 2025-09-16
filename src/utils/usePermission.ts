// hooks/usePermission.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermission = () => {
  const { authUser } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authUser?.uuid) return;

    const uuid = parseUuidToDashes(authUser?.uuid);
    console.log("Parsed UUID:", uuid);
    console.log("fetching Permissions for user:", authUser?.uuid);
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/permissions/user/${uuid}/permissions`, {method: 'GET', credentials: 'include'})
      .then((res) => res.json())
      .then((data) => {
        const perms = Array.isArray(data)
            ? data
            : Array.isArray(data?.permissions)
                ? data.permissions : [];
        setPermissions(perms);
      })
      .catch((err) => {
        console.error('Failed to fetch permissions', err);
        setPermissions([]);
      }).finally(() => setLoading(false));
  }, [authUser?.uuid]);

  const hasPermission = (key: string) => {

    if (permissions.includes(key)) return true;

    for (const perm of permissions) {
      if (perm.endsWith('*')) {
        const prefix = perm.slice(0, -2);
        if (key === perm || key.startsWith(prefix+ ".")) {
          return true;
        }
      }
    }

    return permissions.includes(key);
  };

  return { hasPermission, loading };
};

function parseUuidToDashes(uuid: string) {
    return uuid.replace(/^(.{8})(.{4})(.{4})(.{4})(.+)$/, '$1-$2-$3-$4-$5');
}