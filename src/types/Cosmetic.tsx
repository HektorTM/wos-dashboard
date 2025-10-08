export type Cosmetic = {
    type: string;
    id: string;
    display: string;
    description: string;
    permission?: string;
};

export type CreateCosmeticPopupProps = {
    onClose: () => void;
    onCreate: (newCosmetic: Cosmetic) => void;
};