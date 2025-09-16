import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TitleComp from "../../components/TitleComponent";
import {TableGroupPerms, TableUserPerms} from "./AdminTables.tsx";
import {useTheme} from "../../context/ThemeContext.tsx";

// ====================
// Types matching your routes
// ====================
export type UUID = string;

export interface MCPlayerListItem {
    uuid: UUID;
    username: string;
    is_active?: boolean;
}

export interface UserPermission {
    id: number;
    permission: string;
    value: number; // 1/0
    server: string;
    world: string;
}

export interface GroupPermission {
    id: number;
    permission: string;
    value: number; // 1/0
    server: string;
    world: string;
}

export interface LPGroupRow { id?: number; name: string; }

// ====================
// Small UI bits
// ====================
const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; }>= ({ value, onChange, placeholder }) => (
    <div className="mb-2">
        <input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="form-control" type="text" />
    </div>
);

const Collapsible: React.FC<{ title: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode; }>= ({ title, defaultOpen = true, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="card mb-3">
            <div className="card-header d-flex align-items-center justify-content-between" role="button" onClick={() => setOpen(o => !o)}>
                <strong className="me-2">{open ? '▾' : '▸'} {title}</strong>
            </div>
            {open && <div className="card-body p-2">{children}</div>}
        </div>
    );
};

const ListItem: React.FC<{ active?: boolean; onClick?: () => void; title: string; subtitle?: string; }>= ({ active, onClick, title, subtitle }) => (
    <div className={`list-group-item list-group-item-action ${active ? 'active' : ''}`} onClick={onClick} role="button">
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <div className="fw-semibold">{title}</div>
                {subtitle && <div className="small text-muted">{subtitle}</div>}
            </div>
        </div>
    </div>
);

// ====================
// Main Page
// ====================
const AdminPermissionsPage: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const base = (import.meta as any).env.VITE_API_URL as string;

    // Rails
    const [players, setPlayers] = useState<MCPlayerListItem[]>([]);
    const [groupNames, setGroupNames] = useState<string[]>([]);

    // Selections (mutually exclusive)
    const [selectedUUID, setSelectedUUID] = useState<UUID | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    // Search
    const [playerSearch, setPlayerSearch] = useState("");
    const [groupSearch, setGroupSearch] = useState("");

    // Panel data
    const [userPerms, setUserPerms] = useState<UserPermission[] | null>(null);
    const [groupPerms, setGroupPerms] = useState<GroupPermission[] | null>(null);

    // UI state
    const [loading, setLoading] = useState(true);
    const [panelLoading, setPanelLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inputs for add operations (kept in parent to avoid remount issues)
    const [newUserPerm, setNewUserPerm] = useState('');
    const [newUserGroup, setNewUserGroup] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupPerm, setNewGroupPerm] = useState('');

    // -------- Initial load: players list + groups list --------
    useEffect(() => {
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const pRes = await fetch(`${base}/api/playerdata`, { credentials: 'include' });
                if (!pRes.ok) throw new Error('Failed to load players list');
                const pRows: any[] = await pRes.json();
                const pList: MCPlayerListItem[] = pRows.map((r:any) => ({ uuid: String(r.uuid), username: String(r.username ?? r.name ?? r.uuid), is_active: r.is_active }));
                setPlayers(pList);
                if (pList.length) setSelectedUUID(pList[0].uuid);

                const gRes = await fetch(`${base}/api/permissions/groups`, { credentials: 'include' });
                if (!gRes.ok) throw new Error('Failed to load groups list');
                const gRows: LPGroupRow[] = await gRes.json();
                const names = (gRows || []).map(g => String((g as any).name ?? g)).filter(Boolean);
                setGroupNames(names);
            } catch (e:any) {
                setError(e.message || 'Error loading data');
            } finally {
                setLoading(false);
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -------- Load selected player's permissions --------
    useEffect(() => {
        if (!selectedUUID) return;
        setSelectedGroup(null);
        setPanelLoading(true);
        setGroupPerms(null);
        (async () => {
            try {
                const res = await fetch(`${base}/api/permissions/user/${selectedUUID}`, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to load user permissions');
                const rows: any[] = await res.json();
                const perms: UserPermission[] = (rows || []).map(p => ({
                    id: Number(p.id), permission: String(p.permission), value: Number(p.value), server: String(p.server), world: String(p.world)
                }));
                setUserPerms(perms);
            } catch {
                setUserPerms([]);
            } finally {
                setPanelLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUUID]);

    // -------- Load selected group's permissions --------
    useEffect(() => {
        if (!selectedGroup) return;
        setSelectedUUID(null);
        setPanelLoading(true);
        setUserPerms(null);
        (async () => {
            try {
                const res = await fetch(`${base}/api/permissions/group/${encodeURIComponent(selectedGroup)}`, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to load group permissions');
                const rows: any[] = await res.json();
                const perms: GroupPermission[] = (rows || []).map(p => ({
                    id: Number(p.id), permission: String(p.permission), value: Number(p.value), server: String(p.server), world: String(p.world)
                }));
                setGroupPerms(perms);
            } catch {
                setGroupPerms([]);
            } finally {
                setPanelLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroup]);

    // -------- Derived rails --------
    const filteredPlayers = useMemo(() => {
        const q = playerSearch.toLowerCase().trim();
        if (!q) return players;
        return players.filter(p => p.username.toLowerCase().includes(q) || p.uuid.toLowerCase().includes(q));
    }, [players, playerSearch]);

    const filteredGroups = useMemo(() => {
        const q = groupSearch.toLowerCase().trim();
        if (!q) return groupNames;
        return groupNames.filter(n => n.toLowerCase().includes(q));
    }, [groupNames, groupSearch]);

    // -------- Mutations: Users --------
    const addPermissionToUser = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedUUID || !newUserPerm.trim()) return;
        try {
            const res = await fetch(`${base}/api/permissions/user/${selectedUUID}/permission`, {
                method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permission: newUserPerm.trim() })
            });
            if (!res.ok) throw new Error('Failed to add permission');
            setUserPerms(prev => prev ? [...prev, { id: Date.now(), permission: newUserPerm.trim(), value: 1, server: 'global', world: 'global' }] : prev);
            setNewUserPerm("");
        } catch (e:any) { alert(e.message || 'Failed to add permission'); }
    };

    const removePermissionFromUser = async (perm: string) => {
        if (!selectedUUID) return;
        if (!window.confirm(`Remove permission '${perm}' from this User?`)) return;
        try {
            const res = await fetch(`${base}/api/permissions/user/${selectedUUID}/permission`, {
                method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permission: perm })
            });
            if (!res.ok) throw new Error('Failed to remove permission');
            setUserPerms(prev => prev ? prev.filter(p => p.permission !== perm) : prev);
        } catch (e:any) { alert(e.message || 'Failed to remove permission'); }
    };

    const addUserToGroup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedUUID || !newUserGroup.trim()) return;
        try {
            const res = await fetch(`${base}/api/permissions/user/${selectedUUID}/group`, {
                method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group: newUserGroup.trim() })
            });
            if (!res.ok) throw new Error('Failed to add to group');
            setUserPerms(prev => prev ? [...prev, { id: Date.now(), permission: `group.${newUserGroup.trim()}`, value: 1, server: 'global', world: 'global' }] : prev);
            setNewUserGroup("");
        } catch (e:any) { alert(e.message || 'Failed to add to group'); }
    };

    const removeUserFromGroup = async (group: string) => {
        if (!selectedUUID) return;
        if (!window.confirm(`Remove Group '${group}' from this User?`)) return;
        try {
            const res = await fetch(`${base}/api/permissions/user/${selectedUUID}/group`, {
                method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group })
            });
            if (!res.ok) throw new Error('Failed to remove from group');
            setUserPerms(prev => prev ? prev.filter(p => p.permission !== `group.${group}`) : prev);
        } catch (e:any) { alert(e.message || 'Failed to remove from group'); }
    };

    // -------- Mutations: Groups --------
    const createGroup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const name = newGroupName.trim();
        if (!name) return;
        try {
            const res = await fetch(`${base}/api/permissions/group`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
            if (!res.ok) throw new Error('Failed to create group');
            setGroupNames(prev => [...prev, name].sort());
            setNewGroupName("");
        } catch (e:any) { alert(e.message || 'Failed to create group'); }
    };

    const deleteGroup = async (name: string) => {
        if (!confirm(`Delete group "${name}"? This also removes its nodes and any user membership nodes.`)) return;
        try {
            const res = await fetch(`${base}/api/permissions/group/${encodeURIComponent(name)}`, { method: 'DELETE', credentials: 'include' });
            if (!res.ok) throw new Error('Failed to delete group');
            setGroupNames(prev => prev.filter(n => n !== name));
            if (selectedGroup === name) { setSelectedGroup(null); setGroupPerms(null); }
        } catch (e:any) { alert(e.message || 'Failed to delete group'); }
    };

    const addPermissionToGroup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedGroup || !newGroupPerm.trim()) return;
        try {
            const res = await fetch(`${base}/api/permissions/group/${encodeURIComponent(selectedGroup)}/permission`, {
                method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permission: newGroupPerm.trim() })
            });
            if (!res.ok) throw new Error('Failed to add permission to group');
            setGroupPerms(prev => prev ? [...prev, { id: Date.now(), permission: newGroupPerm.trim(), value: 1, server: 'global', world: 'global' }] : prev);
            setNewGroupPerm("");
        } catch (e:any) { alert(e.message || 'Failed to add permission'); }
    };

    const removePermissionFromGroup = async (perm: string) => {
        if (!selectedGroup) return;
        if (!window.confirm(`Remove permission '${perm}' from group '${selectedGroup}'?`)) return;
        try {
            const res = await fetch(`${base}/api/permissions/group/${encodeURIComponent(selectedGroup)}/permission`, {
                method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permission: perm })
            });
            if (!res.ok) throw new Error('Failed to remove permission from group');
            setGroupPerms(prev => prev ? prev.filter(p => p.permission !== perm) : prev);
        } catch (e:any) { alert(e.message || 'Failed to remove permission'); }
    };

    // ====================
    // Render
    // ====================
    return (
        <div className={`page-container ${theme}`}>
            <TitleComp title="Admin | Staff Portal" />

            <div className="page-header d-flex align-items-center justify-content-between">
                <h2 className="m-0">Permissions Administration</h2>
            </div>

            {loading && <div className="mt-3">Loading…</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {!loading && !error && (
                <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }}>
                    {/* Left rail: BOTH players and groups */}
                    <div>
                        <Collapsible title={<span>Players ({players.length})</span>}>
                            <SearchInput value={playerSearch} onChange={setPlayerSearch} placeholder="Search players…" />
                            <div className="list-group" style={{ maxHeight: 220, overflow: 'auto' }}>
                                {filteredPlayers.map(p => (
                                    <ListItem key={p.uuid} active={selectedUUID===p.uuid} onClick={()=>{ setSelectedUUID(p.uuid); setSelectedGroup(null); }} title={p.username} subtitle={`${p.uuid.slice(0,8)}…`} />
                                ))}
                                {!filteredPlayers.length && <div className="text-muted small p-2">No players found.</div>}
                            </div>
                        </Collapsible>

                        <Collapsible title={<span>Permission Groups ({groupNames.length})</span>}>
                            <SearchInput value={groupSearch} onChange={setGroupSearch} placeholder="Search groups…" />
                            <div className="list-group" style={{ maxHeight: 220, overflow: 'auto' }}>
                                {filteredGroups.map(n => (
                                    <ListItem key={n} active={selectedGroup===n} onClick={()=>{ setSelectedGroup(n); setSelectedUUID(null); }} title={n} />
                                ))}
                                {!filteredGroups.length && <div className="text-muted small p-2">No groups found.</div>}
                            </div>
                            <form className="d-flex gap-2 mt-2" onSubmit={createGroup}>
                                <input className="form-control" placeholder="new group name" value={newGroupName} onChange={(e)=>setNewGroupName(e.target.value)} />
                                <button className="btn btn-outline-primary" type="submit">Create</button>
                            </form>
                        </Collapsible>
                    </div>

                    {/* Main panel */}
                    <div className="card">
                        <div className="card-body">
                            {panelLoading && <div>Loading selection…</div>}

                            {!panelLoading && selectedUUID && userPerms && (
                                <div>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <h4 className="m-0">Player • {players.find(p=>p.uuid===selectedUUID)?.username || selectedUUID}</h4>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-outline-secondary" onClick={()=>navigate(`/users/${selectedUUID}`)}>Open full editor</button>
                                        </div>
                                    </div>
                                    <TableUserPerms
                                        rows={userPerms}
                                        addPermissionToUser={addPermissionToUser}
                                        newUserPerm={newUserPerm}
                                        setNewUserPerm={setNewUserPerm}
                                        addUserToGroup={addUserToGroup}
                                        newUserGroup={newUserGroup}
                                        setNewUserGroup={setNewUserGroup}
                                        groupNames={groupNames}
                                        removeUserFromGroup={removeUserFromGroup}
                                        removePermissionFromUser={removePermissionFromUser}
                                    />
                                </div>
                            )}

                            {!panelLoading && selectedGroup && groupPerms && (
                                <div>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <h4 className="m-0">Group • {selectedGroup}</h4>
                                        <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteGroup(selectedGroup)}>Delete group</button>
                                    </div>
                                    <TableGroupPerms
                                        rows={groupPerms}
                                        addPermissionToGroup={addPermissionToGroup}
                                        newGroupPerm={newGroupPerm}
                                        setNewGroupPerm={setNewGroupPerm}
                                        removePermissionFromGroup={removePermissionFromGroup}
                                    />
                                </div>
                            )}

                            {!panelLoading && !selectedUUID && !selectedGroup && (
                                <div className="text-muted">Pick a player or a group from the left.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPermissionsPage;