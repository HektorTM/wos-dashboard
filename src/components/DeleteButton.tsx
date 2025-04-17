import React from "react";
import { PermissionKey } from '../utils/permissions';
import { usePermission } from "../utils/usePermission";

type DeleteButtonProps = {

    perm: PermissionKey;
    onClick: () => void;
    loading?: boolean;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({  perm, onClick, loading }) => {
  const { hasPermission } = usePermission();
  if (loading) return null;
  if (!hasPermission(perm)) return null;

  return (
    <button
        className="action-btn"
        onClick={onClick}
        title="Delete"
    >
        🗑️
    </button>
  );
};

export default DeleteButton;