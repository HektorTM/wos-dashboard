import React from "react";
import { usePermission } from "../../utils/usePermission.ts";

type DeleteButtonProps = {

    perm?: string;
    onClick: () => void;
    loading?: boolean;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({  perm, onClick, loading }) => {
  const { hasPermission } = usePermission();
  if (loading) return null;
  if (perm !== undefined && perm === null) {
      if (!hasPermission(perm)) return null;

  }

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