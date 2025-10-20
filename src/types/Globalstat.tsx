export type Globalstat = {
    id: string;
    value: number;
    max: string;
    capped: number;
};

export type CreateGlobalStatPopupProps = {
    onClose: () => void;
    onCreate: (newStat: Globalstat) => void;
};
