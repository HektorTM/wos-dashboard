export type Loottable = {
    id: string;
    items?: Loottableitem[];
}

export type Loottableitem = {
    weight: number;
    type: string;
    value: string;
    parameter: number;
}

export type CreateLoottablePopUpProps = {
    onClose: () => void;
    onCreate: (newLoottable: Loottable) => void;
};


export const LTTypeList = () => {
    return (
        <datalist id="lt_types">
            <option value="interaction"></option>
            <option value="gui"></option>
            <option value="citem"></option>
            <option value="dialog"></option>
            <option value="command"></option>
        </datalist>
    );
};