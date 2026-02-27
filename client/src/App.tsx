import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/contexts/cart-context";
import { AlertProvider } from "@/contexts/alert-context";
import { ConfirmProvider } from "@/contexts/confirm-context";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TrainingPage from "@/pages/training-page";
import CoursesPage from "@/pages/courses-page";
import CourseDetailPage from "@/pages/course-detail-page";
import TrainingCoursesPage from "@/pages/training-courses-page";
import CertificateCoursesPage from "@/pages/certificate-courses-page";
import ProfessionalDevelopmentPage from "@/pages/professional-development-page";
import AllAnnouncementsPage from "@/pages/all-announcements-page";
import HelpCenterPage from "@/pages/help-center-page";
import MyPage from "@/pages/my-page";
import AllTrainingProgramsPage from "@/pages/all-training-programs-page";
import BusinessDashboardPage from "@/pages/business-dashboard-page";
import SuperAdminPage from "@/pages/super-admin-page";
import BusinessRegistrationPage from "@/pages/business-registration-page";
import EnhancedNoticePage from "@/pages/enhanced-notice-page";
import CartPage from "@/pages/cart-page";
import AboutPage from "@/pages/about-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import TermsOfServicePage from "@/pages/terms-of-service-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import AnalysisPage from "@/pages/analysis-page";
import NotFound from "@/pages/not-found";
import BusinessPartnershipPage from "@/pages/business-partnership-page";
import AuthorApplicationPage from "@/pages/author-application-page";
import ServicesPage from "@/pages/services-page";
import CareersPage from "@/pages/careers-page";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

function Router() {
  return (
    <div className="w-full bg-gray-900" style={{ margin: 0, padding: 0 }}>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/" component={HomePage} />
        <Route path="/training" component={TrainingPage} />
        <Route path="/courses" component={CoursesPage} />
        <Route path="/courses/:id" component={CourseDetailPage} />
        <Route path="/training-courses" component={TrainingCoursesPage} />
        <Route path="/certificate-courses" component={CertificateCoursesPage} />
        <Route
          path="/professional-development"
          component={ProfessionalDevelopmentPage}
        />
        <Route path="/announcements" component={AllAnnouncementsPage} />
        <Route path="/help" component={HelpCenterPage} />
        <Route
          path="/all-training-programs"
          component={AllTrainingProgramsPage}
        />
        <Route path="/support/about" component={AboutPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-of-service" component={TermsOfServicePage} />
        <Route path="/cookie-policy" component={CookiePolicyPage} />
        <ProtectedRoute path="/cart" component={CartPage} />
        <ProtectedRoute
          path="/business-dashboard"
          component={BusinessDashboardPage}
        />
        <ProtectedRoute path="/super-admin" component={SuperAdminPage} />
        <ProtectedRoute
          path="/enhanced-notice"
          component={EnhancedNoticePage}
        />
        <ProtectedRoute path="/analysis/:id" component={AnalysisPage} />
        <ProtectedRoute path="/mypage" component={MyPage} />
        <Route path="/business-partnership" component={BusinessPartnershipPage} />
        <Route path="/author-application" component={AuthorApplicationPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/careers" component={CareersPage} />
        <Route component={NotFound} />
      </Switch>
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <AlertProvider>
              <ConfirmProvider>
                <Toaster />
                <Router />
              </ConfirmProvider>
            </AlertProvider>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
