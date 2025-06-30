import React, { ReactNode } from 'react';
import { PermissionKey } from '../utils/permissions';

type PermissionLinkProps = {
  perm?: PermissionKey;
  hasPermission: (key: PermissionKey) => boolean;
  loading?: boolean;
  children: ReactNode;
};

const PermissionLink: React.FC<PermissionLinkProps> = ({ perm, hasPermission, loading, children }) => {
  if (loading) return null;

  if (perm === null || perm === undefined) {
    return <>{children}</>
  }

  if (!hasPermission(perm)) return null;

  return (
    <>
      {children}
    </>
  );
};

export default PermissionLink;
