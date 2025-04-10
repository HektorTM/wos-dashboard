import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CurrencyTab from './pages/CurrencyTab';
import CreateCurrency from './pages/CreateCurrency';
import EditCurrency from './pages/EditCurrency';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={ <PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/currencies" element={<CurrencyTab />} />
            <Route path="/currencies/create" element={ <PrivateRoute><CreateCurrency /></PrivateRoute>} />
            <Route path="/currencies/edit/:id" element={<EditCurrency />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
