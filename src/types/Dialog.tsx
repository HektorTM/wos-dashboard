export interface Dialog {
    dialog_id: string;
    char_name: string;
    char_name_color?: string;
    text_color?: string;
    background_color?: string;
    answer_background_color?: string;
    fog_color?: string;
    arrow_color?: string;
    selected_color?: string;
}

export interface DialogPage {
    page_id: number;
    post_action: string;
    pre_action: string;
    lines: PageLine[];
}

export interface PageLine {
    line_id: number;
    line_text: string;
}

export interface DialogAnswer {
    answer_id: number;
    answer_text: string;
    answer_action: string;
}