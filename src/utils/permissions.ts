
export type PermissionKey = 
    | 'ACCESS_ADMIN'
    | 'CURRENCY_VIEW'
    | 'CURRENCY_EDIT'
    | 'CURRENCY_CREATE'
    | 'CURRENCY_DELETE'

export interface Permission {
    key: PermissionKey;
    label: string;
}

export interface PermissionGroup {
    group: string;
    permissions: Permission[];
  }

export const PERMISSIONS: Permission[] = [
    {
        key: 'ACCESS_ADMIN',
        label: 'Access User Administration',
    },
    {
        key: 'CURRENCY_VIEW',
        label: 'View currencies',
    },
    {
        key: 'CURRENCY_EDIT',
        label: 'Edit currencies',
    },
    {
        key: 'CURRENCY_CREATE',
        label: 'Create Currencies',
    },
    {
        key: 'CURRENCY_DELETE',
        label: 'Delete Currencies',
    },   
]

export const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        group: "Currencies",
        permissions: [
            { key: "CURRENCY_VIEW", label: "View Currency"},
            { key: "CURRENCY_EDIT", label: "Edit Currency"},
            { key: "CURRENCY_CREATE", label: "Create Currency"},
            { key: "CURRENCY_DELETE", label: "Delete Currency"},
        ],
    },
    {
        group: "Admin",
        permissions: [
            { key: "ACCESS_ADMIN", label: "Access User Administration"},
        ],
    },
]