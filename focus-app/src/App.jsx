import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
//Default export
import HomePage from "./home/HomePage";
import LoginPage from "./login/LoginPage";
import ResetPass from "./login/ResetPass";
import Register from "./login/Register";
import NavBar from "./navbar/NavBar";
import Footer from "./home/Footer";
import NotFound from "./utils/NotFound";
import AboutUs from "./navbar/products/AboutUs";
import Temp from "./text_reader/Temp"
import ProtectedRoute from "./utils/ProtectedRoute";
// Named export
import { AuthProvider } from "./context/AuthContext";
import NotAuthorized from "./utils/NotAuthorized";
import DashboardOverall from "./user_account/dashboard/DashboardOverall";
import UserAccount from "./user_account/UserAccount";
import UserProfile from "./user_account/settings/UserProfile";
import UserSettings from "./user_account/settings/UserSettings";

function App() {
  return (
    <Router>
      <div>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPass />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/about" element={<AboutUs />} />

            <Route path="/account" element={<UserAccount />}>
              <Route path="dashboard" element={<DashboardOverall />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>


            <Route path="error/404" element={<NotFound />} />
            <Route path="error/403" element={<NotAuthorized />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Temp />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
