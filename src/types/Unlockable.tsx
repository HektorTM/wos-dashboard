export type Unlockable = {
    id: string;
    temp: number;
}

export type CreateUnlockablePopupProps = {
    onClose: () => void;
    onCreate: (newUnlockable: Unlockable) => void;
};