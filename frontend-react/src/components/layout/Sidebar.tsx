import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  Mail,
  Send,
  GitBranch,
  Image as ImageIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, organization, logout } = useAuth();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpenMobile ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-row" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', width: '100%' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, marginRight: 16 }}>
              <div className="sidebar-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 8l10 7 10-7" />
                </svg>
              </div>
              <span className="brand-name">MailFlow</span>
            </div>
          )}

          {/* Integrated 32x32px Header Toggle Button - hidden on mobile via CSS desktop-only-toggle */}
          {onToggleCollapse && !isOpenMobile && (
            <button
              type="button"
              className="sidebar-toggle-btn desktop-only-toggle"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={isCollapsed ? { margin: '0 auto' } : { marginLeft: 'auto' }}
            >
              {isCollapsed ? (
                <ChevronRight style={{ width: 18, height: 18 }} />
              ) : (
                <ChevronLeft style={{ width: 18, height: 18 }} />
              )}
            </button>
          )}

          {/* Mobile Close Button */}
          {isOpenMobile && onCloseMobile && (
            <button
              type="button"
              className="sidebar-toggle-btn mobile-close-btn"
              onClick={onCloseMobile}
              title="Close Menu"
              aria-label="Close Menu"
              style={{ marginLeft: 'auto' }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          )}
        </div>
        {!isCollapsed && (
          <span id="orgNameIndicator" className="org-name">
            {organization?.name || 'Loading…'}
          </span>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {!isCollapsed && <div className="nav-section-label">Main</div>}
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-dashboard"
            title="Dashboard"
          >
            <LayoutDashboard />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink
            to="/customers"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-customers"
            title="Customers"
          >
            <Users />
            {!isCollapsed && <span>Customers</span>}
          </NavLink>
          <NavLink
            to="/segments"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-segments"
            title="Segments"
          >
            <Layers />
            {!isCollapsed && <span>Segments</span>}
          </NavLink>
        </div>

        <div className="nav-section">
          {!isCollapsed && <div className="nav-section-label">Email Studio</div>}
          <NavLink
            to="/templates"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-templates"
            title="Mail Builder"
          >
            <Mail />
            {!isCollapsed && <span>Mail Builder</span>}
          </NavLink>
          <NavLink
            to="/campaigns"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-campaigns"
            title="Campaigns"
          >
            <Send />
            {!isCollapsed && <span>Campaigns</span>}
          </NavLink>
          <NavLink
            to="/abtests"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-abtests"
            title="A/B Tests"
          >
            <GitBranch />
            {!isCollapsed && <span>A/B Tests</span>}
          </NavLink>
        </div>

        <div className="nav-section">
          {!isCollapsed && <div className="nav-section-label">System</div>}
          <NavLink
            to="/assets"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-assets"
            title="Assets"
          >
            <ImageIcon />
            {!isCollapsed && <span>Assets</span>}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-settings"
            title="Settings"
          >
            <Settings />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile" title={`${user?.name || 'User'} (${user?.email || ''})`}>
          <div id="userAvatar" className="user-avatar">
            {userInitial}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <p id="userNameIndicator" className="user-name">
                {user?.name || 'User'}
              </p>
              <p id="userEmailIndicator" className="user-email">
                {user?.email || 'email@org.com'}
              </p>
            </div>
          )}
        </div>
        <button id="logoutBtn" className="logout-btn" onClick={logout} title="Sign Out">
          <LogOut />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
