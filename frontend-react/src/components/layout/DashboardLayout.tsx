import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsOpenMobile(false);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#94a3b8' }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: '#3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <header className="mobile-header">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsOpenMobile(true)}
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
        <span className="mobile-brand-name">MailFlow</span>
        <div style={{ width: 32 }} />
      </header>

      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {isOpenMobile && (
        <div className="sidebar-overlay" onClick={() => setIsOpenMobile(false)} />
      )}

      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

