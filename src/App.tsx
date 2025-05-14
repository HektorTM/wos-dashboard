import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import './styles/App.css';
import ChannelTab from './pages/Channels/ChannelTab';
import Dashboard from './pages/Dashboard';
import UserList from './pages/User/UserList';
import EditUser from './pages/User/ViewUser';
import CreateUser from './pages/User/CreateUser';
import CurrencyTab from './pages/Currency/CurrencyTab';
import CreateCurrency from './pages/Currency/CreateCurrency';
import EditCurrency from './pages/Currency/ViewCurrency';
import UnlockableTab from './pages/Unlockables/UnlockableTab';
import ViewUnlockable from './pages/Unlockables/ViewUnlockable';
import CosmeticTab from './pages/Cosmetics/CosmeticTab';
import CreateCosmetic from './pages/Cosmetics/CreateCosmetic';
import CitemTab from './pages/Citems/CitemTab';
import SearchResults from './pages/Search';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ViewCosmetic from './pages/Cosmetics/ViewCosmetic';
import StatsTab from './pages/Stats/StatsTab';
import ViewStat from './pages/Stats/ViewStat';
import RecipeTab from './pages/Crecipes/CrecipecTab';
import InteractionTab from './pages/Interactions/InteractionTab';
import ViewInteraction from './pages/Interactions/ViewInteraction';
import PlayerTab from './pages/Players/PlayersTab';
import ViewPlayer from './pages/Players/ViewPlayer';



const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Layout */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
          
            {/* Main Layout */}
            <Route element={<MainLayout /> }>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={ <Dashboard />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/citems" element={<ProtectedRoute requiredPermission='CITEM_VIEW'><CitemTab /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute requiredPermission='ADMIN'><UserList /></ProtectedRoute>} />
                <Route path="/currencies" element={<ProtectedRoute requiredPermission='CURRENCY_VIEW'><CurrencyTab /></ProtectedRoute>} />
                <Route path="/unlockables" element={<ProtectedRoute requiredPermission='UNLOCKABLE_VIEW'><UnlockableTab /></ProtectedRoute>} />
                <Route path="/cosmetics" element={<ProtectedRoute requiredPermission='COSMETIC_VIEW'><CosmeticTab /></ProtectedRoute>} />
                <Route path="/channels" element={<ProtectedRoute requiredPermission='CHANNEL_VIEW'><ChannelTab /></ProtectedRoute>} />
                <Route path="/stats" element={<ProtectedRoute requiredPermission='STATS_VIEW'><StatsTab /></ProtectedRoute>} />
                <Route path="/recipes" element={<ProtectedRoute requiredPermission='RECIPE_VIEW'><RecipeTab /></ProtectedRoute>} />
                <Route path="/interactions" element={<ProtectedRoute requiredPermission='INTERACTION_VIEW'><InteractionTab /></ProtectedRoute>} />
                <Route path="/players" element={<ProtectedRoute requiredPermission='PLAYER_VIEW'><PlayerTab></PlayerTab></ProtectedRoute>} />

                <Route path="/create/user" element={<ProtectedRoute requiredPermission='ADMIN'><CreateUser /></ProtectedRoute>} />
                <Route path="/create/currency" element={<ProtectedRoute requiredPermission='CURRENCY_CREATE'><CreateCurrency /></ProtectedRoute>}/>
                <Route path="/create/cosmetic" element={<ProtectedRoute requiredPermission='COSMETIC_CREATE'><CreateCosmetic /></ProtectedRoute>} />
                
                <Route path="/view/user/:id" element={<ProtectedRoute requiredPermission='ADMIN'><EditUser /></ProtectedRoute>} />
                <Route path="/view/currency/:id" element={<ProtectedRoute requiredPermission='CURRENCY_EDIT'><EditCurrency /></ProtectedRoute>} />
                <Route path="/view/cosmetic/:id" element={<ProtectedRoute requiredPermission='COSMETIC_EDIT'><ViewCosmetic/></ProtectedRoute>} />
                <Route path="/view/unlockable/:id" element={<ProtectedRoute requiredPermission='UNLOCKABLE_EDIT'><ViewUnlockable /></ProtectedRoute>} />  
                <Route path="/view/interaction/:id" element={<ProtectedRoute requiredPermission='INTERACTION_EDIT'><ViewInteraction /></ProtectedRoute>} /> 
                <Route path="/view/player/:uuid" element={<ProtectedRoute requiredPermission='PLAYER_VIEW'><ViewPlayer></ViewPlayer></ProtectedRoute>} />


                <Route path="/view/stat/:id" element={<ProtectedRoute requiredPermission='STATS_EDIT'><ViewStat /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
