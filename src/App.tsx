import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import './styles/App.css';
import ChannelTab from './pages/Channels/ChannelTab';
import Dashboard from './pages/Dashboard';
import UserList from './pages/Admin/UserList';
import EditUser from './pages/Admin/ViewUser';
import CreateUser from './pages/Admin/CreateUser';
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
import AccountPage from './pages/Admin/AccountPage';
import CooldownTab from './pages/Cooldowns/CooldownTab';
import ViewCooldown from './pages/Cooldowns/ViewCooldown';
import GuiTab from './pages/Guis/GuiTab';
import ViewGui from './pages/Guis/ViewGui';
import ViewSlot from './pages/Guis/ViewSlot';
import WarpsTab from './pages/Warps/WarpsTab';
import ProjectsTab from "./pages/projects/ProjectsTab.tsx";
import ViewProject from "./pages/projects/ViewProject.tsx";
import TimeTab from './pages/time/TimeTab';
import ViewTime from './pages/time/ViewTime.tsx';
import AdminPermissionsPage from "./pages/Admin/ViewAdmin.tsx";
import DialogTab from './pages/Dialogs/DialogTab';
import ViewDialog from './pages/Dialogs/ViewDialog.tsx';
import ConstantTab from './pages/Constants/ConstantTab';

import Yellowstone from "./pages/yellowstone.tsx";
import ViewConstant from "./pages/Constants/ViewConstant.tsx";

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
                <Route path="/citems" element={<ProtectedRoute requiredPermission='portal.citems.view'><CitemTab /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute requiredPermission='ADMIN'><UserList /></ProtectedRoute>} />
                <Route path="/currencies" element={<ProtectedRoute requiredPermission='portal.currencies.view'><CurrencyTab /></ProtectedRoute>} />
                <Route path="/unlockables" element={<ProtectedRoute requiredPermission='portal.unlockables.view'><UnlockableTab /></ProtectedRoute>} />
                <Route path="/cosmetics" element={<ProtectedRoute requiredPermission='portal.cosmetics.view'><CosmeticTab /></ProtectedRoute>} />
                <Route path="/channels" element={<ProtectedRoute requiredPermission='portal.channels.view'><ChannelTab /></ProtectedRoute>} />
                <Route path="/stats" element={<ProtectedRoute requiredPermission='portal.stats.view'><StatsTab /></ProtectedRoute>} />
                <Route path="/recipes" element={<ProtectedRoute requiredPermission='portal.recipes.view'><RecipeTab /></ProtectedRoute>} />
                <Route path="/interactions" element={<ProtectedRoute requiredPermission='portal.interactions.view'><InteractionTab /></ProtectedRoute>} />
                <Route path="/players" element={<ProtectedRoute requiredPermission=''><PlayerTab></PlayerTab></ProtectedRoute>} />
                <Route path="/fishing" element={<ProtectedRoute requiredPermission='portal.fishing.view'><FishingTab></FishingTab></ProtectedRoute>} />
                <Route path="/cooldowns" element={<ProtectedRoute requiredPermission='portal.cooldowns.view'><CooldownTab></CooldownTab></ProtectedRoute>} />
                <Route path="/guis" element={<ProtectedRoute requiredPermission='portal.guis.view'><GuiTab></GuiTab></ProtectedRoute>} />
                <Route path="/warps" element={<ProtectedRouteNoPerm><WarpsTab></WarpsTab></ProtectedRouteNoPerm>} />
                <Route path="/projects" element={<ProtectedRouteNoPerm><ProjectsTab /></ProtectedRouteNoPerm>} />
                <Route path="/timeevents" element={<ProtectedRoute requiredPermission='portal.timeevents.view'><TimeTab /></ProtectedRoute>} />
                <Route path="/dialogs" element={<ProtectedRoute requiredPermission='portal.dialogs.view'><DialogTab /></ProtectedRoute>} />
                <Route path="/constants" element={<ProtectedRoute requiredPermission='portal.constants.view'><ConstantTab /></ProtectedRoute> } />

                <Route path="/requests" element={<ProtectedRouteNoPerm><RequestTab></RequestTab></ProtectedRouteNoPerm>} />
                <Route path="/bugs" element={<ProtectedRouteNoPerm><BugReportPage></BugReportPage></ProtectedRouteNoPerm>} />
                <Route path="/account" element={<ProtectedRouteNoPerm><AccountPage></AccountPage></ProtectedRouteNoPerm>} />

                <Route path="/create/user" element={<ProtectedRoute requiredPermission='ADMIN'><CreateUser /></ProtectedRoute>} />

                <Route path="/view/user/:id" element={<ProtectedRoute requiredPermission='ADMIN'><EditUser /></ProtectedRoute>} />
                <Route path="/view/currency/:id" element={<ProtectedRoute requiredPermission='portal.currencies.modify'><EditCurrency /></ProtectedRoute>} />
                <Route path="/view/cosmetic/:id" element={<ProtectedRoute requiredPermission='portal.cosmetics.modify'><ViewCosmetic/></ProtectedRoute>} />
                <Route path="/view/unlockable/:id" element={<ProtectedRoute requiredPermission='portal.unlockables.modify'><ViewUnlockable /></ProtectedRoute>} />
                <Route path="/view/interaction/:id" element={<ProtectedRoute requiredPermission='portal.interactions.modify'><ViewInteraction /></ProtectedRoute>} />
                <Route path="/view/player/:uuid" element={<ProtectedRoute requiredPermission=''><ViewPlayer></ViewPlayer></ProtectedRoute>} />
                <Route path="/view/fish/:id" element={<ProtectedRoute requiredPermission='portal.fishing.modify'><ViewFish></ViewFish></ProtectedRoute>} />
                <Route path="/view/cooldown/:id" element={<ProtectedRoute requiredPermission='portal.cooldowns.modify'><ViewCooldown></ViewCooldown></ProtectedRoute>} />
                <Route path="/view/gui/:id" element={<ProtectedRoute requiredPermission='portal.currencies.modify'><ViewGui></ViewGui></ProtectedRoute>} />
                <Route path="/view/gui/:id/:slotNumber" element={<ProtectedRoute requiredPermission='portal.guis.modify'><ViewSlot></ViewSlot></ProtectedRoute>} />
                <Route path="/view/project/:id" element={<ProtectedRouteNoPerm><ViewProject /></ProtectedRouteNoPerm>} />
                <Route path="/view/timeevent/:id" element={<ProtectedRoute requiredPermission='portal.timeevents.modify'><ViewTime /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminPermissionsPage></AdminPermissionsPage>} />
                <Route path="/view/stat/:id" element={<ProtectedRoute requiredPermission='portal.stats.modify'><ViewStat /></ProtectedRoute>} />
                <Route path="/view/dialog/:id" element={<ProtectedRoute requiredPermission='portal.dialogs.modify'><ViewDialog /></ProtectedRoute>} />
                <Route path="/view/constant/:id" element={<ProtectedRoute requiredPermission='portal.constants.modify'><ViewConstant /></ProtectedRoute>} />


                <Route path="/yellowstone" element={<Yellowstone></Yellowstone>} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
