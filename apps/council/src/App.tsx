import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navbar } from "./components/common/Navbar";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

import { CouncilDashboardPage } from "./pages/CouncilDashboardPage";
import { WageSubsidyMapPage } from "./pages/WageSubsidyMapPage";
import { EligibleCompaniesPage } from "./pages/EligibleCompaniesPage";
import { SubsidySchemesPage } from "./pages/SubsidySchemesPage";
import { AllocationsPage } from "./pages/AllocationsPage";
import { CouncilAnalyticsPage } from "./pages/CouncilAnalyticsPage";
import { CouncilAdvisorPage } from "./pages/CouncilAdvisorPage";
import { CouncilSignInPage } from "./pages/CouncilSignInPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <LoadingSpinner size="lg" text="Authenticating council session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/sign-in" element={<CouncilSignInPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CouncilDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <WageSubsidyMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <EligibleCompaniesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schemes"
            element={
              <ProtectedRoute>
                <SubsidySchemesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allocations"
            element={
              <ProtectedRoute>
                <AllocationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <CouncilAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advisor"
            element={
              <ProtectedRoute>
                <CouncilAdvisorPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
