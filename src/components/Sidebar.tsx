import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaHome, FaShieldAlt } from 'react-icons/fa';
import { PiGameControllerBold } from 'react-icons/pi';
import { RiPuzzle2Line } from 'react-icons/ri';
import PermissionLink from './PermissionLink';
import { PermissionKey } from '../utils/permissions';
import { usePermission } from '../utils/usePermission';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

interface Category {
  id: string;
  title: string;
  icon: JSX.Element;
  subItems: SubItem[];
}

interface SubItem {
  id: string;
  title: string;
  href: string;
  disabled?: boolean | false;
  permission?: PermissionKey;
}
const Sidebar = ({isCollapsed, setIsCollapsed}: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { setAuthUser } = useAuth();
  const { hasPermission, loading } = usePermission();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [showSubSidebar, setShowSubSidebar] = useState(false);
  const navigate = useNavigate();

  // Categories data
  const categories: Category[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FaHome />,
      subItems: [
        { id: 'overview', title: 'Overview', href: '/dashboard' },
        { id: 'players', title: 'Players', href: '/players' },
        { id: 'workspace', title: 'Workspace', href: '#', disabled: true}
      ],
    },
    {
      id: 'misc',
      title: 'Misc.',
      icon: <RiPuzzle2Line />,
      subItems: [
        { id: 'requests', title: 'Requests', href: '/requests'},
        { id: 'bugreports', title: 'Bug Reports', href: '/bugs' },
        { id: 'warps', title: 'Warps', href: '/warps'}
      ]
    },
    {
      id: 'gamedesign',
      title: 'Game Design',
      icon: <PiGameControllerBold />,
      subItems: [
        { id: 'channels', title: 'Channels', href: '/channels', permission: 'CHANNEL_VIEW'},
        { id: 'citems', title: 'Citems', href: '/citems', permission: 'CITEM_VIEW'},
        { id: 'cooldowns', title: 'Cooldowns', href: '/cooldowns', permission: 'COOLDOWN_VIEW' },
        { id: 'cosmetics', title: 'Cosmetics', href: '/cosmetics', permission: 'COSMETIC_VIEW' },
        { id: 'currencies', title: 'Currencies', href: '/currencies', permission: 'CURRENCY_VIEW'},
        { id: 'fishing', title: 'Fishing', href: '/fishing', permission: 'FISHING_VIEW' },
        { id: 'guis', title: 'GUIs', href: '/guis', permission: 'GUI_VIEW' },
        { id: 'interactions', title: 'Interactions', href: '/interactions', permission: 'INTERACTION_VIEW' },
        { id: 'loottables', title: 'Loottables', href: '/#', permission: 'LOOTTABLE_VIEW', disabled: true },
        { id: 'recipes', title: 'Recipes', href: '#', permission: 'RECIPE_VIEW', disabled: true},
        { id: 'stats', title: 'Stats', href: '/stats', permission: 'STATS_VIEW' },
        { id: 'unlockables', title: 'Unlockables', href: '/unlockables', permission: 'UNLOCKABLE_VIEW' },
      ],
    },
    {
      id: 'moderation',
      title: 'Moderation',
      icon: <FaShieldAlt />,
      subItems: [
        { id: 'tickets', title: 'Tickets', href: '#', disabled: true},
        { id: 'warnings', title: 'Warnings', href: '#', disabled: true},
        { id: 'logs', title: 'Logs', href: '#', disabled: true}
      ]
    },
    
  ];

  const handleCategoryClick = (category: Category) => {
    setIsCollapsed(false);
    setActiveCategory(category);
    setShowSubSidebar(true);
    
  };

  const handleBackClick = () => {
    setShowSubSidebar(false);
  };

  const handleLogout = async () => {
    if(!window.confirm('Are you sure you want to log out?')) return;

    localStorage.removeItem('authUser');
    setAuthUser(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to log out');
      }

      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleAccount = () => {
    navigate('/account');
  };
  const userpage = () => {
    navigate('/users');
  };

return (
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Main Sidebar */}
      <div className={`sidebar ${showSubSidebar ? 'hidden' : ''}`}>
        <div className="sidebar-header">
          <h3>{isCollapsed ? '' : 'Staff Portal'}</h3>
          <button 
            className="collapse-btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FaChevronLeft className={isCollapsed ? 'rotate-180' : ''} />
          </button>
        </div>
        
        <div className="sidebar-content">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="category-title">{category.title}</span>
                    <FaChevronRight className="arrow" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
      </div>

      {/* Sub Sidebar */}
      <div className={`sub-sidebar ${showSubSidebar ? 'visible' : 'hidden'}`}>
        <div className="sub-sidebar-header">
          <button className="back-btn" onClick={handleBackClick}>
            <FaArrowLeft />
            <span>{!isCollapsed && ''}</span>
          </button>
          {!isCollapsed && <h3>{activeCategory?.title}</h3>}
        </div>
        
        <div className="sub-sidebar-content">
          {activeCategory?.subItems.map((subItem) => (
            <PermissionLink perm={subItem.permission ? subItem.permission : undefined} hasPermission={hasPermission} loading={loading}>
              <a 
                key={subItem.id} 
                onClick={() => navigate(subItem.href)}
                className={`subitem ${subItem.disabled ? 'disabled' : ''}`}
              >
                {!isCollapsed && subItem.title}
              </a>
            </PermissionLink>
          ))}
        </div>
      </div>
      <div className='sidebar-footer'>
        {hasPermission('ADMIN') && (
          <button className="admin-btn" onClick={userpage}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            {isCollapsed ? '' : 'Administration'}
          </button>
        )}
        <div className="footer-buttons-row">
          {!isCollapsed && (
            <button 
              onClick={handleAccount}
              className="account-btn"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
              </svg>
            </button>
          )}
          
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            {isCollapsed ? '' : 'Logout'}
          </button>
          {!isCollapsed && (
            <button 
              onClick={toggleTheme}
              className="theme-toggle-icon"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;