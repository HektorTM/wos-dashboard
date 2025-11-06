export type Currency = {
    id: string;
    name: string;
    short_name: string;
    icon: string;
    color: string;
    hidden_if_zero: number;
};

export type CreateCurrencyPopupProps = {
    onClose: () => void;
    onCreate: (newCurrency: Currency) => void;
};