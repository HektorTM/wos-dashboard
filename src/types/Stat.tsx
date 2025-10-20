export type Stat = {
    id: string;
    max: string;
    capped: number;
};

export type CreateStatPopupProps = {
    onClose: () => void;
    onCreate: (newStat: Stat) => void;
};
