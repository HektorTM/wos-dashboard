import PermissionList from "../../components/PermissionDataList.tsx";
import {GroupPermission, UserPermission} from "./ViewAdmin.tsx";
import React from "react";

const Badge: React.FC<{ ok: boolean }> = ({ ok }) => (
    <span className={`badge ${ok ? 'bg-success' : 'bg-secondary'}`}>{ok ? 'true' : 'false'}</span>
);

export const TableUserPerms: React.FC<{
    rows: UserPermission[];
    addPermissionToUser: (e?: React.FormEvent) => void;
    newUserPerm: string;
    setNewUserPerm: (value: string) => void;
    addUserToGroup: (e?: React.FormEvent) => void;
    newUserGroup: string;
    setNewUserGroup: (value: string) => void;
    groupNames: string[];
    removeUserFromGroup: (group: string) => void;
    removePermissionFromUser: (perm: string) => void;
}> = ({
          rows, addPermissionToUser, newUserPerm, setNewUserPerm,
          addUserToGroup, newUserGroup, setNewUserGroup, groupNames,
          removeUserFromGroup, removePermissionFromUser
      }) => {
    const groupRows = rows.filter(r => r.permission.startsWith('group.'));
    const directRows = rows.filter(r => !r.permission.startsWith('group.'));
    return (
        <>
            <form className="d-flex gap-2 mb-3" onSubmit={addPermissionToUser}>
                <input className="form-control" list='permission_nodes' placeholder="permission.node" value={newUserPerm} onChange={(e)=>setNewUserPerm(e.target.value)} />
                <PermissionList></PermissionList>
                <button className="btn btn-primary" type="submit">Add Permission</button>
            </form>

            <div className="mb-2 fw-semibold"> Group Memberships</div>
            <form className="d-flex gap-2 mb-2" onSubmit={addUserToGroup}>
                <input className="form-control" placeholder="group name" value={newUserGroup} onChange={(e)=>setNewUserGroup(e.target.value)} list="groupList" />
                <datalist id="groupList">{groupNames.map(n => <option key={n} value={n} />)}</datalist>
                <button className="btn btn-outline-primary" type="submit">Add to Group</button>
            </form>

            <div className="table-responsive mb-4">
                <table className="table align-middle">
                    <thead><tr><th>Group</th><th>Node</th><th>Actions</th></tr></thead>
                    <tbody>
                    {groupRows.map(r => {
                        const group = r.permission.replace(/^group\./,'');
                        return (
                            <tr key={`g-${r.id}-${r.permission}`}>
                                <td className="font-monospace">{group}</td>
                                <td className="font-monospace">{r.permission}</td>
                                <td><button className="btn btn-sm btn-outline-danger" onClick={()=>removeUserFromGroup(group)}>Remove</button></td>
                            </tr>
                        );
                    })}
                    {!groupRows.length && <tr><td colSpan={3} className="text-muted small">No group memberships.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="mb-2 fw-semibold">Direct Permissions</div>
            <div className="table-responsive">
                <table className="table align-middle">
                    <thead><tr><th>Permission</th><th>Value</th><th>Server</th><th>World</th><th>Actions</th></tr></thead>
                    <tbody>
                    {directRows.map(r => (
                        <tr key={r.id}>
                            <td className="font-monospace">{r.permission}</td>
                            <td><Badge ok={Number(r.value) === 1} /></td>
                            <td className="font-monospace">{r.server}</td>
                            <td className="font-monospace">{r.world}</td>
                            <td><button className="btn btn-sm btn-outline-danger" onClick={()=>removePermissionFromUser(r.permission)}>Remove</button></td>
                        </tr>
                    ))}
                    {!directRows.length && <tr><td colSpan={5} className="text-muted small">No direct permissions.</td></tr>}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export const TableGroupPerms: React.FC<{
    rows: GroupPermission[];
    addPermissionToGroup: (e?: React.FormEvent) => void;
    newGroupPerm: string;
    setNewGroupPerm: (value: string) => void;
    removePermissionFromGroup: (perm: string) => void;
}> = ({ rows, addPermissionToGroup, newGroupPerm, setNewGroupPerm, removePermissionFromGroup }) => (
    <>
        <form className="d-flex gap-2 mb-3" onSubmit={addPermissionToGroup}>
            <input className="form-control" list="permission_nodes" placeholder="permission.node" value={newGroupPerm} onChange={(e)=>setNewGroupPerm(`${e.target.value}`)} />
            <PermissionList></PermissionList>
            <button className="btn btn-primary" type="submit">Add Permission</button>
        </form>
        <div className="table-responsive">
            <table className="table align-middle">
                <thead><tr><th>Permission</th><th>Value</th><th>Server</th><th>World</th><th>Actions</th></tr></thead>
                <tbody>
                {rows.map(r => (
                    <tr key={r.id}>
                        <td className="font-monospace">{r.permission}</td>
                        <td><Badge ok={Number(r.value) === 1} /></td>
                        <td className="font-monospace">{r.server}</td>
                        <td className="font-monospace">{r.world}</td>
                        <td><button className="btn btn-sm btn-outline-danger" onClick={()=>removePermissionFromGroup(r.permission)}>Remove</button></td>
                    </tr>
                ))}
                {!rows.length && <tr><td colSpan={5} className="text-muted small">No permissions yet.</td></tr>}
                </tbody>
            </table>
        </div>
    </>
);