export type PermissionKey = 
    | 'ADMIN'
    | 'ALWAYS_ACTIVE'
    | 'CITEM_VIEW'
    | 'CITEM_EDIT'
    | 'CITEM_DELETE'
    | 'RECIPE_VIEW'
    | 'RECIPE_EDIT'
    | 'RECIPE_DELETE'
    | 'COOLDOWN_VIEW'
    | 'COOLDOWN_CREATE'
    | 'COOLDOWN_EDIT'
    | 'COOLDOWN_DELETE'
    | 'COSMETIC_VIEW'
    | 'COSMETIC_CREATE'
    | 'COSMETIC_EDIT'
    | 'COSMETIC_DELETE'
    | 'CURRENCY_VIEW'
    | 'CURRENCY_CREATE'
    | 'CURRENCY_EDIT'
    | 'CURRENCY_DELETE'
    | 'GUI_VIEW'
    | 'GUI_CREATE'
    | 'GUI_EDIT'
    | 'GUI_DELETE'
    | 'INTERACTION_VIEW'
    | 'INTERACTION_CREATE'
    | 'INTERACTION_EDIT'
    | 'INTERACTION_DELETE'
    | 'LOOTTABLE_VIEW'
    | 'LOOTTABLE_CREATE'
    | 'LOOTTABLE_EDIT'
    | 'LOOTTABLE_DELETE'
    | 'PROFESSION_VIEW'
    | 'PROFESSION_CREATE'
    | 'PROFESSION_EDIT'
    | 'PROFESSION_DELETE'
    | 'STATS_VIEW'
    | 'STATS_CREATE'
    | 'STATS_EDIT'
    | 'STATS_DELETE'
    | 'UNLOCKABLE_VIEW'
    | 'UNLOCKABLE_CREATE'
    | 'UNLOCKABLE_EDIT'
    | 'UNLOCKABLE_DELETE'
    | 'CHANNEL_VIEW'
    | 'CHANNEL_CREATE'
    | 'CHANNEL_EDIT'
    | 'CHANNEL_DELETE'
    | 'FISHING_VIEW'
    | 'FISHING_CREATE'
    | 'FISHING_EDIT'
    | 'FISHING_DELETE'
    | 'PLAYER_VIEW'
    | 'UNLOCK'




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
        key: 'ADMIN',
        label: 'Access User Administration',
    },
    {
        key: 'ALWAYS_ACTIVE',
        label: 'Always Active',
    },
    {
        key: 'CITEM_VIEW',
        label: 'View Citems',
    },
    {
        key: 'CITEM_EDIT',
        label: 'Edit Citems',
    },
    {
        key: 'CITEM_DELETE',
        label: 'Delete Citems',
    },

    {
        key: 'RECIPE_VIEW',
        label: 'View Recipes',
    },
    {
        key: 'RECIPE_EDIT',
        label: 'Edit Recipes',
    },
    {
        key: 'RECIPE_DELETE',
        label: 'Delete Recipes',
    },

    {
        key: 'COOLDOWN_VIEW',
        label: 'View Cooldowns',
    },
    {
        key: 'COOLDOWN_CREATE',
        label: 'Create Cooldowns',
    },
    {
        key: 'COOLDOWN_EDIT',
        label: 'Edit Cooldowns',
    },
    {
        key: 'COOLDOWN_DELETE',
        label: 'Delete Cooldowns',
    },

    {
        key: 'COSMETIC_VIEW',
        label: 'View Cosmetics',
    },
    {
        key: 'COSMETIC_CREATE',
        label: 'Create Cosmetics',
    },
    {
        key: 'COSMETIC_EDIT',
        label: 'Edit Cosmetics',
    },
    {
        key: 'COSMETIC_DELETE',
        label: 'Delete Cosmetics',
    },
    {
        key: 'CURRENCY_VIEW',
        label: 'View Currencies',
    },
    {
        key: 'CURRENCY_CREATE',
        label: 'Create Currencies',
    },
    {
        key: 'CURRENCY_EDIT',
        label: 'Edit Currencies',
    },
    {
        key: 'CURRENCY_DELETE',
        label: 'Delete Currencies',
    },
    {
        key: 'GUI_VIEW',
        label: 'View GUIs',
    },
    {
        key: 'GUI_CREATE',
        label: 'Create GUIs',
    },
    {
        key: 'GUI_EDIT',
        label: 'Edit GUIs',
    },
    {
        key: 'GUI_DELETE',
        label: 'Delete GUIs',
    },
    {
        key: 'INTERACTION_VIEW',
        label: 'View Interactions',
    },
    {
        key: 'INTERACTION_CREATE',
        label: 'Create Interactions',
    },
    {
        key: 'INTERACTION_EDIT',
        label: 'Edit Interactions',
    },
    {
        key: 'INTERACTION_DELETE',
        label: 'Delete Interactions',
    },
    {
        key: 'LOOTTABLE_VIEW',
        label: 'View Loot Tables',
    },
    {
        key: 'LOOTTABLE_CREATE',
        label: 'Create Loot Tables',
    },
    {
        key: 'LOOTTABLE_EDIT',
        label: 'Edit Loot Tables',
    },
    {
        key: 'LOOTTABLE_DELETE',
        label: 'Delete Loot Tables',
    },
    {
        key: 'PROFESSION_VIEW',
        label: 'View Professions',
    },
    {
        key: 'PROFESSION_CREATE',
        label: 'Create Professions',
    },
    {
        key: 'PROFESSION_EDIT',
        label: 'Edit Professions',
    },
    {
        key: 'PROFESSION_DELETE',
        label: 'Delete Professions',
    },
    {
        key: 'STATS_VIEW',
        label: 'View Stats',
    },
    {
        key: 'STATS_CREATE',
        label: 'Create Stats',
    },
    {
        key: 'STATS_EDIT',
        label: 'Edit Stats',
    },
    {
        key: 'STATS_DELETE',
        label: 'Delete Stats',
    },
    {
        key: 'UNLOCKABLE_VIEW',
        label: 'View Unlockables',
    },
    {
        key: 'UNLOCKABLE_CREATE',
        label: 'Create Unlockables',
    },
    {
        key: 'UNLOCKABLE_EDIT',
        label: 'Edit Unlockables',
    },
    {
        key: 'UNLOCKABLE_DELETE',
        label: 'Delete Unlockables',
    },
    {
        key: 'CHANNEL_VIEW',
        label: 'View Channel',
    },
    {
        key: 'CHANNEL_CREATE',
        label: 'Create Channel',
    },
    {
        key: 'CHANNEL_EDIT',
        label: 'Edit Channel',
    },
    {
        key: 'CHANNEL_DELETE',
        label: 'Delete Channel',
    },
    {
        key: 'FISHING_VIEW',
        label: 'View FISHING',
    },
    {
        key: 'FISHING_CREATE',
        label: 'Create FISHING',
    },
    {
        key: 'FISHING_EDIT',
        label: 'Edit FISHING',
    },
    {
        key: 'FISHING_DELETE',
        label: 'Delete FISHING',
    },
    {
        key: 'PLAYER_VIEW',
        label: 'View Players'
    },
    {
        key: 'UNLOCK',
        label: 'Unlock Items'
    }

];

export const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        group: "Admin",
        permissions: [
            { key: "ADMIN", label: "Access User Administration" },
            { key: "ALWAYS_ACTIVE", label: "Always Active" },
        ],
    },
    {
        group: "Misc",
        permissions: [
            { key: "UNLOCK", label: "Unlock Items"},
        ]
    },
    {
        group: "Cosmetics",
        permissions: [
            { key: "COSMETIC_VIEW", label: "View Cosmetics" },
            { key: "COSMETIC_CREATE", label: "Create Cosmetics" },
            { key: "COSMETIC_EDIT", label: "Edit Cosmetics" },
            { key: "COSMETIC_DELETE", label: "Delete Cosmetics" },
        ],
    },

    

    {
        group: "Currencies",
        permissions: [
            { key: "CURRENCY_VIEW", label: "View Currencies" },
            { key: "CURRENCY_CREATE", label: "Create Currencies" },
            { key: "CURRENCY_EDIT", label: "Edit Currencies" },
            { key: "CURRENCY_DELETE", label: "Delete Currencies" },
        ],
    },
    {
        group: "GUIs",
        permissions: [
            { key: "GUI_VIEW", label: "View GUIs" },
            { key: "GUI_CREATE", label: "Create GUIs" },
            { key: "GUI_EDIT", label: "Edit GUIs" },
            { key: "GUI_DELETE", label: "Delete GUIs" },
        ],
    },
    {
        group: "Interactions",
        permissions: [
            { key: "INTERACTION_VIEW", label: "View Interactions" },
            { key: "INTERACTION_CREATE", label: "Create Interactions" },
            { key: "INTERACTION_EDIT", label: "Edit Interactions" },
            { key: "INTERACTION_DELETE", label: "Delete Interactions" },
        ],
    },
    {
        group: "Loot Tables",
        permissions: [
            { key: "LOOTTABLE_VIEW", label: "View Loot Tables" },
            { key: "LOOTTABLE_CREATE", label: "Create Loot Tables" },
            { key: "LOOTTABLE_EDIT", label: "Edit Loot Tables" },
            { key: "LOOTTABLE_DELETE", label: "Delete Loot Tables" },
        ],
    },
    {
        group: "Professions",
        permissions: [
            { key: "PROFESSION_VIEW", label: "View Professions" },
            { key: "PROFESSION_CREATE", label: "Create Professions" },
            { key: "PROFESSION_EDIT", label: "Edit Professions" },
            { key: "PROFESSION_DELETE", label: "Delete Professions" },
        ],
    },
    {
        group: "Stats",
        permissions: [
            { key: "STATS_VIEW", label: "View Stats" },
            { key: "STATS_CREATE", label: "Create Stats" },
            { key: "STATS_EDIT", label: "Edit Stats" },
            { key: "STATS_DELETE", label: "Delete Stats" },
        ],
    },
    {
        group: "Unlockables",
        permissions: [
            { key: "UNLOCKABLE_VIEW", label: "View Unlockables" },
            { key: "UNLOCKABLE_CREATE", label: "Create Unlockables" },
            { key: "UNLOCKABLE_EDIT", label: "Edit Unlockables" },
            { key: "UNLOCKABLE_DELETE", label: "Delete Unlockables" },
        ],
    },
    {
        group: "Cooldowns",
        permissions: [
            { key: "COOLDOWN_VIEW", label: "View Cooldowns" },
            { key: "COOLDOWN_CREATE", label: "Create Cooldowns" },
            { key: "COOLDOWN_EDIT", label: "Edit Cooldowns" },
            { key: "COOLDOWN_DELETE", label: "Delete Cooldowns" },
        ],
    },
    {
        group: "Citems",
        permissions: [
            { key: "CITEM_VIEW", label: "View Citems" },
            { key: "CITEM_EDIT", label: "Edit Citems" },
            { key: "CITEM_DELETE", label: "Delete Citems" },
        ],
    },
    {
        group: "Recipes",
        permissions: [
            { key: "RECIPE_VIEW", label: "View Recipes" },
            { key: "RECIPE_EDIT", label: "Edit Recipes" },
            { key: "RECIPE_DELETE", label: "Delete Recipes" },
        ],
    },
    {
        group: "Channels",
        permissions: [
            { key: "CHANNEL_VIEW", label: "View Channels" },
            { key: "CHANNEL_CREATE", label: "Create Channels"},
            { key: "CHANNEL_EDIT", label: "Edit Channels" },
            { key: "CHANNEL_DELETE", label: "Delete Channels" },
        ],
    },

    {
        group: "Fishing",
        permissions: [
            { key: "FISHING_VIEW", label: "View Fishing" },
            { key: "FISHING_CREATE", label: "Create Fish"},
            { key: "FISHING_EDIT", label: "Edit Fish" },
            { key: "FISHING_DELETE", label: "Delete Fish" },
        ],
    },

    {
        group: "Players",
        permissions: [
            {key: "PLAYER_VIEW", label: "View Players"},
        ]
    },
];