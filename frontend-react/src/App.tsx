import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { SegmentsPage } from './pages/SegmentsPage';
import { SegmentMatchesPage } from './pages/SegmentMatchesPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { ABTestsPage } from './pages/ABTestsPage';
import { AssetsPage } from './pages/AssetsPage';
import { SettingsPage } from './pages/SettingsPage';

// Campaign Studio Sub-pages
import { CampaignDetailsLayout } from './pages/campaigns/CampaignDetailsLayout';
import { CampaignPerformancePage } from './pages/campaigns/CampaignPerformancePage';
import { CampaignAnalyticsPage } from './pages/campaigns/CampaignAnalyticsPage';
import { CampaignCustomerDetailsPage } from './pages/campaigns/CampaignCustomerDetailsPage';
import { CampaignErrorAnalysisPage } from './pages/campaigns/CampaignErrorAnalysisPage';
import { CampaignFilteredListPage } from './pages/campaigns/CampaignFilteredListPage';

import './assets/style.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/segments" element={<SegmentsPage />} />
              <Route path="/segments/:id/matches" element={<SegmentMatchesPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/abtests" element={<ABTestsPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Campaign Studio — Dedicated Detail Pages */}
              <Route path="/campaigns/:id" element={<CampaignDetailsLayout />}>
                <Route index element={<Navigate to="performance" replace />} />
                <Route path="performance" element={<CampaignPerformancePage />} />
                <Route path="analytics" element={<CampaignAnalyticsPage />} />
                <Route path="details" element={<CampaignCustomerDetailsPage />} />
                <Route path="errors" element={<CampaignErrorAnalysisPage />} />
              </Route>

              {/* Filtered Customer Status Pages (stand-alone pages outside the detail layout) */}
              <Route path="/campaigns/:id/:filter" element={<CampaignDetailsLayout />}>
                <Route index element={<CampaignFilteredListPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
