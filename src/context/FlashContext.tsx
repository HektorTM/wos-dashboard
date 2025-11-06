import React, { createContext, useContext, useEffect, useState } from "react";

export type FlashType = "success" | "error" | "info";

export interface FlashMessage {
    id: string;
    text: string;
    type: FlashType;
    timeout?: number;
}

interface FlashContextProps {
    addFlash: (text: string, type?: FlashType, timeout?: number) => void;
    removeFlash: (id: string) => void;
}

const FlashContext = createContext<FlashContextProps>({
    addFlash: () => {},
    removeFlash: () => {},
});

export const useFlash = () => useContext(FlashContext);

export const FlashProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                           children,
                                                                       }) => {
    const [messages, setMessages] = useState<FlashMessage[]>([]);
    const [closing, setClosing] = useState<string[]>([]);

    useEffect(() => {
        const stored: FlashMessage[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith("flash-")) {
                const data = localStorage.getItem(key);
                if (data) stored.push(JSON.parse(data));
            }
        }
        setMessages(stored);
    }, []);

    const actuallyRemove = (id: string) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        localStorage.removeItem(`flash-${id}`);
        setClosing((prev) => prev.filter((cid) => cid !== id));
    };

    const removeFlash = (id: string) => {
        setClosing((prev) => [...prev, id]);
        setTimeout(() => actuallyRemove(id), 500); // match fade-out time
    };

    const addFlash = (text: string, type: FlashType = "info", timeout?: number) => {
        const id = crypto.randomUUID();
        const autoTimeout =
            timeout ??
            (type === "success"
                ? 7000
                : type === "info"
                    ? 5000
                    : undefined);

        const message: FlashMessage = { id, text, type, timeout: autoTimeout };
        setMessages((prev) => [...prev, message]);
        localStorage.setItem(`flash-${id}`, JSON.stringify(message));

        if (autoTimeout) {
            setTimeout(() => removeFlash(id), autoTimeout);
        }
    };

    return (
        <FlashContext.Provider value={{ addFlash, removeFlash }}>
            {children}
            <div className="flash-container">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flash-message ${msg.type} ${
                            closing.includes(msg.id) ? "closing" : ""
                        }`}
                    >
                        <span>{msg.text}</span>
                        <button
                            className="flash-close"
                            onClick={() => removeFlash(msg.id)}
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </FlashContext.Provider>
    );
};
