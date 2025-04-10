import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { JSX } from 'react';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
