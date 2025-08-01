import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import EditCurrency from './pages/Currency/ViewCurrency';
import UnlockableTab from './pages/Unlockables/UnlockableTab';
import ViewUnlockable from './pages/Unlockables/ViewUnlockable';
import CosmeticTab from './pages/Cosmetics/CosmeticTab';
import CitemTab from './pages/Citems/CitemTab';
import SearchResults from './pages/Search';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, ProtectedRouteNoPerm } from './components/ProtectedRoute';
import ViewCosmetic from './pages/Cosmetics/ViewCosmetic';
import StatsTab from './pages/Stats/StatsTab';
import ViewStat from './pages/Stats/ViewStat';
import RecipeTab from './pages/Crecipes/CrecipecTab';
import InteractionTab from './pages/Interactions/InteractionTab';
import ViewInteraction from './pages/Interactions/ViewInteraction';
import PlayerTab from './pages/Players/PlayersTab';
import ViewPlayer from './pages/Players/ViewPlayer';
import FishingTab from './pages/Fishing/FishingTab';
import ViewFish from './pages/Fishing/ViewFish';
import RequestTab from './pages/Requests/RequestTab';
import BugReportPage from './pages/Bugs';
import AccountPage from './pages/User/AccountPage';
import CooldownTab from './pages/Cooldowns/CooldownTab';
import ViewCooldown from './pages/Cooldowns/ViewCooldown';
import GuiTab from './pages/Guis/GuiTab';
import ViewGui from './pages/Guis/ViewGui';
import ViewSlot from './pages/Guis/ViewSlot';
import WarpsTab from './pages/Warps/WarpsTab';
import ProjectsTab from "./pages/projects/ProjectsTab.tsx";
import ViewProject from "./pages/projects/ViewProject.tsx";



const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
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
                <Route path="/fishing" element={<ProtectedRoute requiredPermission='FISHING_VIEW'><FishingTab></FishingTab></ProtectedRoute>} />
                <Route path="/cooldowns" element={<ProtectedRoute requiredPermission='COOLDOWN_VIEW'><CooldownTab></CooldownTab></ProtectedRoute>} />
                <Route path="/guis" element={<ProtectedRoute requiredPermission='GUI_VIEW'><GuiTab></GuiTab></ProtectedRoute>} />
                <Route path="/warps" element={<ProtectedRouteNoPerm><WarpsTab></WarpsTab></ProtectedRouteNoPerm>} />
                <Route path="/projects" element={<ProtectedRouteNoPerm><ProjectsTab /></ProtectedRouteNoPerm>} />

                <Route path="/requests" element={<ProtectedRouteNoPerm><RequestTab></RequestTab></ProtectedRouteNoPerm>} />
                <Route path="/bugs" element={<ProtectedRouteNoPerm><BugReportPage></BugReportPage></ProtectedRouteNoPerm>} />
                <Route path="/account" element={<ProtectedRouteNoPerm><AccountPage></AccountPage></ProtectedRouteNoPerm>} />

                <Route path="/create/user" element={<ProtectedRoute requiredPermission='ADMIN'><CreateUser /></ProtectedRoute>} />

                <Route path="/view/user/:id" element={<ProtectedRoute requiredPermission='ADMIN'><EditUser /></ProtectedRoute>} />
                <Route path="/view/currency/:id" element={<ProtectedRoute requiredPermission='CURRENCY_EDIT'><EditCurrency /></ProtectedRoute>} />
                <Route path="/view/cosmetic/:id" element={<ProtectedRoute requiredPermission='COSMETIC_EDIT'><ViewCosmetic/></ProtectedRoute>} />
                <Route path="/view/unlockable/:id" element={<ProtectedRoute requiredPermission='UNLOCKABLE_EDIT'><ViewUnlockable /></ProtectedRoute>} />  
                <Route path="/view/interaction/:id" element={<ProtectedRoute requiredPermission='INTERACTION_EDIT'><ViewInteraction /></ProtectedRoute>} /> 
                <Route path="/view/player/:uuid" element={<ProtectedRoute requiredPermission='PLAYER_VIEW'><ViewPlayer></ViewPlayer></ProtectedRoute>} />
                <Route path="/view/fish/:id" element={<ProtectedRoute requiredPermission='FISHING_EDIT'><ViewFish></ViewFish></ProtectedRoute>} />
                <Route path="/view/cooldown/:id" element={<ProtectedRoute requiredPermission='COOLDOWN_EDIT'><ViewCooldown></ViewCooldown></ProtectedRoute>} />
                <Route path="/view/gui/:id" element={<ProtectedRoute requiredPermission='GUI_EDIT'><ViewGui></ViewGui></ProtectedRoute>} />
                <Route path="/view/gui/:id/:slotNumber" element={<ProtectedRoute requiredPermission='GUI_EDIT'><ViewSlot></ViewSlot></ProtectedRoute>} />
                <Route path="/view/project/:id" element={<ProtectedRouteNoPerm><ViewProject /></ProtectedRouteNoPerm>} />
                

                <Route path="/view/stat/:id" element={<ProtectedRoute requiredPermission='STATS_EDIT'><ViewStat /></ProtectedRoute>} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
