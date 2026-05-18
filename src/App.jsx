import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivateHomePage from "./pages/PrivateHomePage";
import CreateAnnonce from "./pages/CreateAnnonce";
import { useAuth } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import MyAnnoncesPage from "./pages/MyAnnoncesPage";
import AnnonceDetailPage from "./pages/AnnonceDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import MessagesPage from "./pages/MessagesPage";
import AllAnnoncesPage from "./pages/AllAnnoncesPage";
import VerifyPage from "./pages/VerifyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="center-loader">Chargement en cours...</div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/verification-email" element={<VerifyPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
      <Route path="/annonces" element={<AllAnnoncesPage />} />
      <Route path="/annonces/:id" element={<AnnonceDetailPage />} />
      <Route path="/vendeurs/:id" element={<UserProfilePage />} />
            <Route
              path="/favoris"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
      <Route
        path="/creer-annonce"
        element={
          <ProtectedRoute>
            <CreateAnnonce />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mes-annonces"
        element={
          <ProtectedRoute>
            <MyAnnoncesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <PrivateHomePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
