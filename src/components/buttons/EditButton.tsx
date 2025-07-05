import React from "react";
import { useNavigate } from "react-router-dom";
import { PermissionKey } from '../../utils/permissions.ts';
import { usePermission } from "../../utils/usePermission.ts";

type EditButtonProps = {
    perm: PermissionKey;
    nav: string;
    loading?: boolean;
};

const EditButton: React.FC<EditButtonProps> = ({  perm, nav, loading }) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  if (loading) return null;
  if (!hasPermission(perm)) return null;

  return (
    <button
        className="action-btn"
        onClick={() => navigate(nav)}
        title="Edit"
    >
        ✏️
    </button>
  );
};

export default EditButton;