export type Constant = {
    id: string;
    value: string;
}

export type CreateConstantPopupProps = {
    onClose: () => void;
    onCreate: (newConstant: Constant) => void;
};