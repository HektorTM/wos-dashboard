import type {JSX} from "react";

export interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

export interface Category {
    id: string;
    title: string;
    icon: JSX.Element;
    subItems: SubItem[];
}

export interface SubItem {
    id: string;
    title: string;
    href: string;
    disabled?: boolean | false;
    permission?: string;
}