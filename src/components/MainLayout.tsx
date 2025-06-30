// Layout.tsx
import { Outlet } from 'react-router-dom'; // This renders the dynamic content based on the route
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false); 
  
  return (
    <>

      <div className={`layout-wrapper ${collapsed ? 'collapsed' : ''}`}>  
        <Sidebar isCollapsed={collapsed} setIsCollapsed={setCollapsed} />
        <div className="main-wrapper">
          
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
