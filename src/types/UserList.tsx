export type User = {
    uuid: string;
    username: string;
    is_active: boolean;
};

export interface UserListProps {
    value: string;
    onChange: (uuid: string) => void;
}