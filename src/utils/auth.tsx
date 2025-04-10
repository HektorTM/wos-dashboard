export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('user');
  };
  
  export const logout = () => {
    localStorage.removeItem('user');
  };
  