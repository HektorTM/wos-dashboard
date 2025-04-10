import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CurrencyTab from './pages/CurrencyTab';
import CreateCurrency from './pages/CreateCurrency';
import EditCurrency from './pages/EditCurrency';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/create-currency" element={
            <PrivateRoute>
              <CreateCurrency />
            </PrivateRoute>
          }
        />
        
      <Route path="/currencies" element={<CurrencyTab />} />
      <Route path="/edit-currency/:id" element={<EditCurrency />} />
      </Routes>
    </Router>
  );
};

export default App;
