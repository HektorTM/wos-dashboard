import React, { useEffect, useState } from "react";
import { usePermission } from "../../utils/usePermission.ts";
import { useAuth } from "../../context/AuthContext.tsx";

interface Project {
    id: string;
    uuid: string;
    name: string;
    public: boolean;
    notes: string;
    items?: ProjectItem[];
    members?: ProjectMember[];
}

interface ProjectItem {
    id: string;
    type: string;
    item_id: string;
    added_by: string;
    added_by_username?: string;
}

interface ProjectMember {
    id: string;
    uuid: string;
    username?: string;
}

type EditButtonProps = {
    id: string;
    onClick: () => void;
    loading?: boolean;
};

export const ProjectDeleteButton: React.FC<EditButtonProps> = ({ id, onClick, loading }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { hasPermission } = usePermission();
    const { authUser } = useAuth();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    const data = await response.json();
                    setProject({
                        id: data.data[0].id,
                        uuid: data.data[0].uuid,
                        name: data.data[0].name,
                        public: data.data[0].public,
                        notes: data.data[0].notes,
                        items: data.items || [],
                        members: data.users || []
                    });
                } else {
                    console.error('Failed to fetch project');
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading || isLoading) return null;


    const canDelete =
        authUser?.uuid === project?.uuid ||
        hasPermission('ADMIN_PROJECT_DELETE');

    if (!canDelete) return null;

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