import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthUser = {
  uuid: string;
  username: string;
};

type AuthContextType = {
  authUser: AuthUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  authLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  setAuthUser: () => {},
  authLoading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [authLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Call backend logout endpoint if needed
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear frontend auth state
      setAuthUser(null);
      localStorage.removeItem('authUser');
      navigate('/login', { replace: true });
    }
  };

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
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          method: 'GET',
          credentials: 'include',
        });
    
        if (response.ok) {
          const data = await response.json();
          setAuthUser(data.user);
        } else {
          await logout(); // Use the logout function if the user is not valid
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);