import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';

import Dashboard from './pages/Dashboard';
import UserList from './pages/User/UserList';
import EditUser from './pages/User/EditUser';
import CreateUser from './pages/User/CreateUser';
import CurrencyTab from './pages/Currency/CurrencyTab';
import CreateCurrency from './pages/Currency/CreateCurrency';
import EditCurrency from './pages/Currency/EditCurrency';
import UnlockableTab from './pages/Unlockables/UnlockableTab';
import CreateUnlockable from './pages/Unlockables/CreateUnlockable';
import EditUnlockable from './pages/Unlockables/EditUnlockable';
import CitemTab from './pages/Citems/CitemTab';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './ThemeContext';


const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Auth Layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
        
          {/* Main Layout */}

          <Route element={<ProtectedRoute> <MainLayout /> </ProtectedRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={ <Dashboard />} />
              <Route path="/admin/users" element={ <UserList />} />
              <Route path="/admin/users/create" element={ <CreateUser />} />
              <Route path="/admin/users/edit/:id" element={ <EditUser />} />
              <Route path="/currencies" element={<CurrencyTab />} />
              <Route path="/currencies/create" element={ <CreateCurrency /> }/>
              <Route path="/currencies/edit/:id" element={<EditCurrency />} />
              <Route path="/unlockables" element={<UnlockableTab />} />
              <Route path="/unlockables/create" element={<CreateUnlockable />} />
              <Route path="/unlockables/edit/:id" element={<EditUnlockable />} />
              <Route path="/citems" element={<CitemTab />} />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
