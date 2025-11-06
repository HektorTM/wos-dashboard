import React, {ReactNode} from 'react';

type PermissionLinkProps = {
    perm?: string;
    hasPermission: (key: string) => boolean;
    loading?: boolean;
    children: ReactNode;
};

const PermissionLink: React.FC<PermissionLinkProps> = ({perm, hasPermission, loading, children}) => {
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
