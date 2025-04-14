import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import './styles/App.css';
import Dashboard from './pages/Dashboard';
import UserList from './pages/User/UserList';
import EditUser from './pages/User/ViewUser';
import CreateUser from './pages/User/CreateUser';
import CurrencyTab from './pages/Currency/CurrencyTab';
import CreateCurrency from './pages/Currency/CreateCurrency';
import EditCurrency from './pages/Currency/ViewCurrency';
import UnlockableTab from './pages/Unlockables/UnlockableTab';
import CreateUnlockable from './pages/Unlockables/CreateUnlockable';
import ViewUnlockable from './pages/Unlockables/ViewUnlockable';
import CosmeticTab from './pages/Cosmetics/CosmeticTab';
import CitemTab from './pages/Citems/CitemTab';
import SearchResults from './pages/Search';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';



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
              <Route path="/search" element={<SearchResults />} />
              <Route path="/citems" element={<CitemTab />} />
              <Route path="/users" element={ <UserList />} />
              <Route path="/currencies" element={<CurrencyTab />} />
              <Route path="/unlockables" element={<UnlockableTab />} />
              <Route path="/cosmetics" element={<CosmeticTab />} />

              <Route path="/create/user" element={ <CreateUser />} />
              <Route path="/create/currency" element={ <CreateCurrency /> }/>
              <Route path="/create/unlockable" element={<CreateUnlockable />} />
              
              <Route path="/view/user/:id" element={ <EditUser />} />
              <Route path="/view/currency/:id" element={<EditCurrency />} />
              <Route path="/view/unlockable/:id" element={<ViewUnlockable />} />
              
              
              
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
