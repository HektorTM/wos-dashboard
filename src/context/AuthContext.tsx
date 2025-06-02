import { createContext, useContext, useEffect, useState } from 'react';

type AuthUser = {
  uuid: string;
  username: string;
};

const AuthContext = createContext<{
  authUser: AuthUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}>({
  authUser: null,
  setAuthUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });

  // Sync localStorage when authUser changes
  useEffect(() => {
    if (authUser) {
      localStorage.setItem('authUser', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [authUser]);

  // Always try to fetch the actual user from backend
  useEffect(() => {
    const fetchUser = async () => {
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        setAuthUser(data.user);
      }
    };
  
    fetchUser();
  }, []);
  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
