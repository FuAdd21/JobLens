import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext/AuthContext.jsx";
import Admin from "./pages/Admin/Admin.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Discover from "./pages/Discover/Discover.jsx";
import Landing from "./pages/Landing/Landing.jsx";
import Login from "./pages/Login/Login.jsx";
import NotificationHistory from "./pages/NotificationHistory/NotificationHistory.jsx";
import ProfileSetup from "./pages/ProfileSetup/ProfileSetup.jsx";
import Register from "./pages/Register/Register.jsx";

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Dashboard/Discover/ProfileSetup ship their own Stitch app-shell
              (Sidebar + header), so they're not wrapped in the old top Navbar. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          {/* Not yet migrated to the Stitch design -- keep the existing Navbar shell. */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotificationHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;