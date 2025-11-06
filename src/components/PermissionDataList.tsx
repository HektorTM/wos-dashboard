import {useEffect, useState} from "react";

const PermissionList = () => {

    const [permissions, setPermissions] = useState<string[]>([]);
    const base = (import.meta).env.VITE_API_URL as string;

    useEffect(() => {
        const run = async () => {

            try {
                const pRes = await fetch(`${base}/api/permissions`, {credentials: 'include'});
                if (!pRes.ok) throw new Error('Failed to load players list');
                const pData = await pRes.json();
                const perms = pData.map((p: { permission: string }) => p.permission);
                setPermissions(perms);
            } catch (err) {
                console.error(err);
            }
        };
        run();
    }, []);


    return (
        <datalist id="permission_nodes">
            {permissions.map((perm, index) => (
                <option key={index} value={perm}>{perm}</option>
            ))}
        </datalist>
    );
};

export default PermissionList;