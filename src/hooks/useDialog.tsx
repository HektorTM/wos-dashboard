import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchLocked, touchPageMeta } from '../helpers/PageMeta';
import { Dialog, DialogAnswer, DialogPage, PageLine } from '../types/Dialog';
import { useFlash } from '../context/FlashContext';
import { useAuth } from '../context/AuthContext';
import {apiFetch, apiFetchJson} from "../utils/api.tsx";

const API = import.meta.env.VITE_API_URL as string;
const dialogBase = (id: string | number) => `${API}/api/dialogs/${id}`;

export function useDialog(id: string | undefined) {
    const { authUser } = useAuth();
    const { addFlash } = useFlash();
    const [dialog, setDialog] = useState<Dialog | null>(null);
    const [pages, setPages] = useState<DialogPage[]>([]);
    const [answers, setAnswers] = useState<DialogAnswer[]>([]);
    const [locked, setLocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const base = useMemo(() => (id ? dialogBase(id) : ''), [id]);

    const flashError = useCallback(
        (e: unknown) => {
            console.error(e);
            addFlash('Connection Error', 'error');
        },
        [addFlash]
    );

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [d, rawPages, a] = await Promise.all([
                apiFetchJson<Dialog>(`${base}`),
                apiFetchJson<Array<Omit<DialogPage, 'lines'>>>(`${base}/pages`),
                apiFetchJson<DialogAnswer[]>(`${base}/answers`),
            ]);
            const pagesWithLines: DialogPage[] = await Promise.all(
                rawPages.map(async (p) => {
                    const lines = await apiFetchJson<PageLine[]>(`${base}/pages/${p.page_id}/lines`);
                    return { ...p, lines };
                })
            );
            setDialog(d);
            setPages(pagesWithLines);
            setAnswers(a);
        } catch (e) {
            flashError(e);
            setDialog(null);
            setPages([]);
        } finally {
            setLoading(false);
        }
    }, [id, base, flashError]);

    const refreshLock = useCallback(async () => {
        if (!id) return;
        try {
            const result = await fetchLocked('dialog', `${id}`);
            setLocked(result === 1);
        } catch (e) {
            console.error(e);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
        refreshLock();
    }, [fetchData, refreshLock]);

    // CRUD operations
    const addPage = async (data: Partial<DialogPage>) => {
        if (!id) return;
        try {
            const created = await apiFetchJson<DialogPage>(`${base}/page`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pre_action: data.pre_action, post_action: data.post_action }),
            });
            setPages((prev) => [...prev, { ...created, lines: [] }]);
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    const editPage = async (page: DialogPage) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/page/${page.page_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pre_action: page.pre_action, post_action: page.post_action }),
            });
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
            addFlash('Page Updated', "success", 7000);
        } catch (e) {
            flashError(e);
        }
    };

    const deletePage = async (pageId: number) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/page/${pageId}?uuid=${authUser?.uuid}`, { method: 'DELETE' });
            setPages((prev) => prev.filter((p) => p.page_id !== pageId));
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    const addLine = async (pageId: number, data: Partial<PageLine>) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/pages/${pageId}/line`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ line_text: data.line_text }),
            });
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    const editLine = async (pageId: number, line: PageLine) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/page/${pageId}/lines/${line.line_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ line_text: line.line_text }),
            });
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    const deleteLine = async (pageId: number, lineId: number) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/page/${pageId}/line/${lineId}`, { method: 'DELETE' });
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    const addAnswer = async (data: Partial<DialogAnswer>) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer_text: data.answer_text, answer_action: data.answer_action }),
            });
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    const editAnswer = async (answer: DialogAnswer) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/answer/${answer.answer_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer_text: answer.answer_text, answer_action: answer.answer_action }),
            });
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    const deleteAnswer = async (answerId: number) => {
        if (!id) return;
        try {
            await apiFetch(`${base}/answer/${answerId}`, { method: 'DELETE' });
            await fetchData();
            await touchPageMeta('dialog', `${id}`, authUser?.uuid || '');
        } catch (e) {
            flashError(e);
        }
    };

    return {
        dialog,
        pages,
        answers,
        loading,
        locked,
        fetchData,
        addPage,
        editPage,
        deletePage,
        addLine,
        editLine,
        deleteLine,
        addAnswer,
        editAnswer,
        deleteAnswer,
    };
}
