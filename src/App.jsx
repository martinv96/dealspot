import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivateHomePage from "./pages/PrivateHomePage";
import CreateAnnonce from "./pages/CreateAnnonce";
import { useAuth } from "./context/useAuth";
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
import AProposPage from "./pages/AProposPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import CgvPage from "./pages/CgvPage";
import { Error403Page, Error404Page, Error429Page, Error500Page, ErrorDefaultPage } from "./pages/ErrorPage";

const DEFAULT_SEO = {
  title: "DealSpot - Petites annonces locales",
  description:
    "DealSpot vous aide à acheter et vendre localement: annonces, messagerie, favoris et profils vendeurs.",
  robots: "index, follow"
};

function getSeoConfig(pathname, isAuthenticated) {
  if (pathname === "/") {
    if (isAuthenticated) {
      return {
        title: "Espace utilisateur - DealSpot",
        description:
          "Connectez-vous à votre espace DealSpot pour gérer vos annonces, favoris, messages et profil.",
        robots: "noindex, nofollow"
      };
    }

    return {
      title: "DealSpot - Achetez et vendez localement",
      description:
        "Decouvrez des annonces près de chez vous sur DealSpot. Achetez, vendez et échangez en toute simplicité.",
      robots: "index, follow"
    };
  }

  if (pathname === "/annonces") {
    return {
      title: "Toutes les annonces - DealSpot",
      description:
        "Parcourez toutes les annonces DealSpot par catégorie, prix et localisation.",
      robots: "index, follow"
    };
  }

  if (pathname.startsWith("/annonces/")) {
    return {
      title: "Detail annonce - DealSpot",
      description:
        "Consultez les détails de l'annonce, les photos, la localisation et contactez le vendeur sur DealSpot.",
      robots: "index, follow"
    };
  }

  if (pathname === "/a-propos") {
    return {
      title: "A propos - DealSpot",
      description:
        "Decouvrez la mission de DealSpot et son fonctionnement pour la vente locale entre particuliers.",
      robots: "index, follow"
    };
  }

  if (pathname === "/contact") {
    return {
      title: "Contact - DealSpot",
      description:
        "Contactez l'équipe DealSpot pour toute question liée aux annonces et à votre compte.",
      robots: "index, follow"
    };
  }

  if (pathname.startsWith("/vendeurs/")) {
    return {
      title: "Profil vendeur - DealSpot",
      description:
        "Consultez le profil public d'un vendeur et ses annonces disponibles sur DealSpot.",
      robots: "index, follow"
    };
  }

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/admin" ||
    pathname === "/profil" ||
    pathname === "/messages" ||
    pathname === "/favoris" ||
    pathname === "/mes-annonces" ||
    pathname === "/creer-annonce"
  ) {
    return {
      title: "Espace utilisateur - DealSpot",
      description:
        "Connectez-vous à votre espace DealSpot pour gérer vos annonces, favoris, messages et profil.",
      robots: "noindex, nofollow"
    };
  }

  return DEFAULT_SEO;
}

function setMeta(name, content, attribute = "name") {
  let meta = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setCanonical(href) {
  let link = document.head.querySelector("link[rel=\"canonical\"]");
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function SeoManager() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const seo = getSeoConfig(location.pathname, isAuthenticated);
    const canonicalUrl = window.location.origin + location.pathname;

    document.title = seo.title;
    setMeta("description", seo.description);
    setMeta("robots", seo.robots);
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setCanonical(canonicalUrl);
  }, [isAuthenticated, location.pathname]);

  return null;
}

function ScrollToTop () {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo ({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function RootRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="center-loader">Chargement en cours...</div>;
  return isAuthenticated ? <PrivateHomePage /> : <HomePage />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="center-loader">Chargement en cours...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div className="center-loader">Chargement en cours...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function SellerRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div className="center-loader">Chargement en cours...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "vendeur") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <SeoManager />

      <ScrollToTop />

      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/a-propos" element={<AProposPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verification-email" element={<VerifyPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
        <Route path="/annonces" element={<AllAnnoncesPage />} />
        <Route path="/annonces/:id" element={<AnnonceDetailPage />} />
        <Route path="/vendeurs/:id" element={<UserProfilePage />} />
        <Route path="/cgv" element={<CgvPage />} />
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
            <SellerRoute>
              <CreateAnnonce />
            </SellerRoute>
          }
        />
        <Route
          path="/mes-annonces"
          element={
            <SellerRoute>
              <MyAnnoncesPage />
            </SellerRoute>
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
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="/403" element={<Error403Page />} />
        <Route path="/404" element={<Error404Page />} />
        <Route path="/429" element={<Error429Page />} />
        <Route path="/500" element={<Error500Page />} />
        <Route path="/erreur" element={<ErrorDefaultPage />} />        
        <Route path="*" element={<Error404Page />} />      
      </Routes>
    </>
  );
}
