import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import DocumentTypesPage from "./pages/DocumentTypesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RequestFormPage from "./pages/RequestFormPage";
import RequestsPage from "./pages/RequestsPage";
import "./App.css";

function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="route-loading">Checking your session...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return <AppShell />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="route-loading">Checking your session...</p>;
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/new" element={<RequestFormPage />} />
        <Route path="/requests/:id/edit" element={<RequestFormPage />} />
        <Route path="/document-types" element={<DocumentTypesPage />} />
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/manage" element={<RequestsPage adminView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
