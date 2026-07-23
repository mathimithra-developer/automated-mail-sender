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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, organization, logout } = useAuth();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          <div className="sidebar-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="M2 8l10 7 10-7" />
            </svg>
          </div>
          <span className="brand-name">MailFlow</span>
        </div>
        <span id="orgNameIndicator" className="org-name">
          {organization?.name || 'Loading…'}
        </span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-dashboard"
        >
          <LayoutDashboard />
          Dashboard
        </NavLink>

        <div className="nav-section-label">Audience</div>
        <NavLink
          to="/customers"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-customers"
        >
          <Users />
          Customers
        </NavLink>
        <NavLink
          to="/segments"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-segments"
        >
          <Layers />
          Segments
        </NavLink>

        <div className="nav-section-label">Email</div>
        <NavLink
          to="/templates"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-templates"
        >
          <Mail />
          Mail Builder
        </NavLink>
        <NavLink
          to="/campaigns"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-campaigns"
        >
          <Send />
          Campaigns
        </NavLink>
        <NavLink
          to="/abtests"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-abtests"
        >
          <GitBranch />
          A/B Tests
        </NavLink>

        <div className="nav-section-label">Media</div>
        <NavLink
          to="/assets"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-assets"
        >
          <ImageIcon />
          Assets
        </NavLink>

        <div className="nav-section-label">Account</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-settings"
        >
          <Settings />
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div id="userAvatar" className="user-avatar">
            {userInitial}
          </div>
          <div className="user-details">
            <p id="userNameIndicator" className="user-name">
              {user?.name || 'User'}
            </p>
            <p id="userEmailIndicator" className="user-email">
              {user?.email || 'email@org.com'}
            </p>
          </div>
        </div>
        <button id="logoutBtn" className="logout-btn" onClick={logout}>
          <LogOut />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
