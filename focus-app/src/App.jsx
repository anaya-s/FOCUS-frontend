import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
//Default export
import HomePage from "./home/HomePage";
import LoginPage from "./login/LoginPage";
import ResetPass from "./login/ResetPass";
import Onboarding from "./onboarding/OnboardingPage";
import ResetPassRequest from "./login/ResetPassRequest";
import Register from "./login/Register";
import NavBar from "./navbar/NavBar";
import Footer from "./home/Footer";
import NotFound from "./utils/NotFound";
import NotAuthorized from "./utils/NotAuthorized";
import AboutUs from "./navbar/products/AboutUs";
import DocumentDrivePage from "./document_drive/drive";
import OurProducts from "./navbar/products/OurProducts";
import TermsAndConditions from "./home/TermsAndConditions";
import PrivacyPolicy from "./home/PrivacyPolicy";
import TextReaderPage from "./text_reader/TextReader";
import CalibrationPage from "./calibration/Calibration";
import ProtectedRoute from "./utils/ProtectedRoute";
// Named export
import { AuthProvider } from "./context/AuthContext";
import DashboardOverall from "./user_account/dashboard/DashboardOverall";
import UserAccount from "./user_account/UserAccount";
import UserProfile from "./user_account/settings/UserProfile";
import UserSettings from "./user_account/settings/UserSettings";
import DiagnosticPage from "./diagnostics/DiagnosticPage";
import VerifyEmail from "./login/VerifyEmail";

function AllPages() {
  const location = useLocation();
  const showFooter = location.pathname !== "/drive"; // Boolean flag used to hide footer for Drive page

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password-request" element={<ResetPassRequest />} />
        <Route path="/reset-password" element={<ResetPass />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/error/403" element={<NotAuthorized />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/products" element={<OurProducts />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route 
          path="/drive"
          element={
            <ProtectedRoute>
              <DocumentDrivePage />
            </ProtectedRoute>
          }     
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <UserAccount />
            </ProtectedRoute>
          }
        >
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardOverall />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />
        </Route>

        <Route
          path="/calibrate"
          element={
            <ProtectedRoute>
              <CalibrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reading"
          element={
            <ProtectedRoute>
              <TextReaderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diagnostics"
          element={
            <ProtectedRoute>
              <DiagnosticPage />
            </ProtectedRoute>
          }
        />
        {/* catch all other routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AllPages />
      </AuthProvider>
    </Router>
  );
}

export default App;