// Layout.tsx
import { Outlet } from 'react-router-dom'; // This renders the dynamic content based on the route
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Outlet /> {/* This renders the page-specific content */}
      </div>
    </div>
  );
};

export default Layout;
