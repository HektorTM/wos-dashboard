import React, {useEffect, useMemo, useState} from 'react';
import {useTheme} from '../context/ThemeContext';
import TitleComp from './TitleComponent';
import {usePermission} from '../utils/usePermission.ts';
import {parseMinecraftColorCodes} from "../utils/parser.tsx";


export type Column<T> = {
    key: string;
    header: string | React.ReactNode;
    cell: (item: T) => React.ReactNode;
    boolean?: boolean;

    thStyle?: React.CSSProperties;
    tdStyle?: React.CSSProperties;
};

export type CreatePopupProps<T> = {
    onClose: () => void;
    onCreate: (newItem: T) => void;
};

export type PermissionChecker = (perm: string) => boolean;

export type ListPageProps<T> = {
    title: string;
    endpoint: string;
    getId: (item: T) => string;
    columns: Column<T>[];
    searchAccessors?: Array<(item: T) => string | number | undefined | null>;
    searchPlaceholder?: string;
    mapResponse?: (raw: any) => T[];
    onRowClick?: (item: T) => void;
    rowClickPermission?: string;
    createPermission?: string;
    CreatePopup?: React.ComponentType<CreatePopupProps<T>>;
    requestInit?: RequestInit;
    emptyState?: React.ReactNode;
    emptyStateFiltered?: React.ReactNode;
    rightActions?: React.ReactNode;
    className?: string;
};

export function GenericListPage<T>(props: ListPageProps<T>) {
    const {
        title,
        endpoint,
        getId,
        columns,
        searchAccessors = [],
        searchPlaceholder = 'Search…',
        mapResponse,
        onRowClick,
        rowClickPermission,
        createPermission,
        CreatePopup,
        requestInit,
        emptyState,
        emptyStateFiltered,
        rightActions,
        className,
    } = props;

    const {theme} = useTheme();
    const {hasPermission} = usePermission();

    const [items, setItems] = useState<T[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setError('');

                const res = await fetch(endpoint, {
                    method: 'GET',
                    credentials: 'include',
                    signal: ac.signal,
                    ...(requestInit || {}),
                });
                if (!res.ok) throw new Error(`Failed to load list (${res.status})`);
                const raw = await res.json();
                const data = mapResponse ? mapResponse(raw) : (raw as T[]);
                setItems(data);
            } catch (e: any) {
                if (e?.name === 'AbortError') return;
                console.error(e);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [endpoint]);

    const filtered = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((it) =>
            searchAccessors.some((fn) => String(fn(it) ?? '').toLowerCase().includes(q))
        );
    }, [items, search, searchAccessors]);

    const canCreate = createPermission ? hasPermission(createPermission) : !!CreatePopup;
    const canRowClick = rowClickPermission ? hasPermission(rowClickPermission) : true;

    const handleCreated = (newItem: T) => setItems((prev) => [...prev, newItem]);

    return (
        <div className={`page-container ${theme} ${className ?? ''}`.trim()}>
            <TitleComp title={`${title} | Staff Portal`}/>

            <div className="page-header">
                <h2>{title}</h2>

                <div className="page-search">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>

                {rightActions}

                {canCreate && CreatePopup && (
                    <button onClick={() => setShowCreate(true)} className="create-button">
                        + Create
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"/>
                    <p>Loading…</p>
                </div>
            ) : (
                <div className="page-table-container">
                    <table className="page-table">
                        <thead>
                        <tr style={{height: 32}}>
                            {columns.map((c) => (
                                <th key={c.key} style={{padding: '4px 8px', ...(c.thStyle || {})}}>
                                    {c.header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((item) => {
                            const id = getId(item);
                            const clickable = !!onRowClick && canRowClick;
                            return (
                                <tr
                                    key={id}
                                    style={{height: 32, cursor: clickable ? 'pointer' : 'default'}}
                                    onClick={() => clickable && onRowClick?.(item)}
                                >
                                    {columns.map((c) => (
                                        <td key={c.key + id} style={{padding: '4px 8px', ...(c.tdStyle || {})}}>
                                            {c.boolean ? (c.cell(item) ? '✅' : '❌') : parseMinecraftColorCodes(`${c.cell(item)}`)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="no-results">
                                    {search
                                        ? emptyStateFiltered || 'No matching results'
                                        : emptyState || 'No data available'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreate && CreatePopup && (
                <CreatePopup onClose={() => setShowCreate(false)} onCreate={handleCreated}/>
            )}
        </div>
    );
}
