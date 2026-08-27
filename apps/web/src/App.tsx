import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { SignUpPage } from "./pages/auth/SignUpPage";

// Youth Pages
import { YouthCoachPage } from "./pages/youth/YouthCoachPage";
import { YouthOnboardingPage } from "./pages/youth/YouthOnboardingPage";
import { YouthProfilePage } from "./pages/youth/YouthProfilePage";
import { OpportunityBrowsePage } from "./pages/youth/OpportunityBrowsePage";
import { OpportunityDetailPage } from "./pages/youth/OpportunityDetailPage";
import { YouthApplicationsPage } from "./pages/youth/YouthApplicationsPage";
import { YouthMatchesPage } from "./pages/youth/YouthMatchesPage";

// Business Pages
import { BusinessAssistantPage } from "./pages/business/BusinessAssistantPage";
import { BusinessOnboardingPage } from "./pages/business/BusinessOnboardingPage";
import { BusinessProfilePage } from "./pages/business/BusinessProfilePage";
import { BusinessOpportunitiesPage } from "./pages/business/BusinessOpportunitiesPage";
import { EditOpportunityPage } from "./pages/business/EditOpportunityPage";
import { OpportunityApplicantsPage } from "./pages/business/OpportunityApplicantsPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route
                  path="/opportunities"
                  element={<OpportunityBrowsePage />}
                />
                <Route
                  path="/opportunities/:id"
                  element={<OpportunityDetailPage />}
                />

                {/* Youth Protected Routes */}
                <Route
                  path="/coach"
                  element={
                    <ProtectedRoute allowedRoles={["youth"]}>
                      <YouthCoachPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute allowedRoles={["youth"]}>
                      <YouthOnboardingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={["youth"]}>
                      <YouthProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute allowedRoles={["youth"]}>
                      <YouthApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute allowedRoles={["youth"]}>
                      <YouthMatchesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Business Protected Routes */}
                <Route
                  path="/business"
                  element={<Navigate to="/business/assistant" replace />}
                />
                <Route
                  path="/business/assistant"
                  element={
                    <ProtectedRoute allowedRoles={["business"]}>
                      <BusinessAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/onboarding"
                  element={
                    <ProtectedRoute allowedRoles={["business"]}>
                      <BusinessOnboardingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/profile"
                  element={
                    <ProtectedRoute allowedRoles={["business"]}>
                      <BusinessProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/opportunities"
                  element={
                    <ProtectedRoute allowedRoles={["business"]}>
                      <BusinessOpportunitiesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/opportunities/create"
                  element={<Navigate to="/business/assistant" replace />}
                />
                <Route
                  path="/business/opportunities/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={["business"]}>
                      <EditOpportunityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/opportunities/:id/applicants"
                  element={
                    <ProtectedRoute allowedRoles={["business"]}>
                      <OpportunityApplicantsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
