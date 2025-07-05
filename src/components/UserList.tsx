import { useEffect, useState } from "react";

type User = {
  uuid: string;
  username: string;
  is_active: boolean;
};

interface UserListProps {
  value: string;
  onChange: (uuid: string) => void;
}

const UserList = ({ value, onChange }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter((user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleSelect = (user: User) => {
    onChange(user.uuid);
    setSearchTerm(user.username);
    setShowDropdown(false);
  };

  const selectedUsername = users.find((u) => u.uuid === value)?.username || "";

  return (
      <div className="user-select-container">
        <input
            type="text"
            placeholder="Select user"
            value={searchTerm || selectedUsername}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === "") {
                onChange("");
              }
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="form-control"
        />

        {showDropdown && !loading && (
            <div className="user-dropdown">
              {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                      <div
                          key={user.uuid}
                          onClick={() => handleSelect(user)}
                          className={`user-dropdown-item ${
                              value === user.uuid ? "selected" : ""
                          } ${!user.is_active ? "inactive" : ""}`}
                      >
                        {user.username}
                        {!user.is_active && " (inactive)"}
                      </div>
                  ))
              ) : (
                  <div className="user-dropdown-empty">No users found</div>
              )}
            </div>
        )}

        {loading && <div className="loading-indicator">Loading users...</div>}
      </div>
  );
};

export default UserList;