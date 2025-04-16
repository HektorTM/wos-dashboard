import React from 'react';
import { Link } from 'react-router-dom';
import { PermissionKey } from '../utils/permissions';

type PermissionLinkProps = {
  to: string;
  label: string;
  perm: PermissionKey;
  hasPermission: (key: PermissionKey) => boolean;
  loading?: boolean;
};

const PermissionLink: React.FC<PermissionLinkProps> = ({ to, label, perm, hasPermission, loading }) => {
  if (loading) return null;
  if (!hasPermission(perm)) return null;

  return (
    <li>
      <Link to={to}>{label}</Link>
    </li>
  );
};

export default PermissionLink;
