
export interface Gui {
    id: string;
    size: number;
    title: string;
    open_actions: string[];
    close_actions: string[];
}

export interface Slot {
    gui_id: string;
    slot: number;
    slot_id: number;
    matchtype: string;
    material: string;
    display_name: string;
    lore: string;
    custom_model_data: number | null;
    enchanted: boolean | null;
    right_click: string;
    left_click: string;
    visible: number;
}