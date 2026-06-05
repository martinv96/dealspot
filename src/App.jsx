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

const DEFAULT_SEO = {
  title: "DealSpot - Petites annonces locales",
  description:
    "DealSpot vous aide a acheter et vendre localement: annonces, messagerie, favoris et profils vendeurs.",
  robots: "index, follow"
};

function getSeoConfig(pathname) {
  if (pathname === "/") {
    return {
      title: "DealSpot - Achetez et vendez localement",
      description:
        "Decouvrez des annonces pres de chez vous sur DealSpot. Achetez, vendez et echangez en toute simplicite.",
      robots: "index, follow"
    };
  }

  if (pathname === "/annonces") {
    return {
      title: "Toutes les annonces - DealSpot",
      description:
        "Parcourez toutes les annonces DealSpot par categorie, prix et localisation.",
      robots: "index, follow"
    };
  }

  if (pathname.startsWith("/annonces/")) {
    return {
      title: "Detail annonce - DealSpot",
      description:
        "Consultez les details de l'annonce, les photos, la localisation et contactez le vendeur sur DealSpot.",
      robots: "index, follow"
    };
  }

  if (pathname === "/apropos") {
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
        "Contactez l'equipe DealSpot pour toute question liee aux annonces et a votre compte.",
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
    pathname === "/connexion" ||
    pathname === "/inscription" ||
    pathname === "/verification-email" ||
    pathname === "/mot-de-passe-oublie" ||
    pathname === "/reinitialiser-mot-de-passe" ||
    pathname === "/app" ||
    pathname === "/profil" ||
    pathname === "/messages" ||
    pathname === "/favoris" ||
    pathname === "/mes-annonces" ||
    pathname === "/creer-annonce"
  ) {
    return {
      title: "Espace utilisateur - DealSpot",
      description:
        "Connectez-vous a votre espace DealSpot pour gerer vos annonces, favoris, messages et profil.",
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

  useEffect(() => {
    const seo = getSeoConfig(location.pathname);
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
  }, [location.pathname]);

  return null;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="center-loader">Chargement en cours...</div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <SeoManager />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apropos" element={<AProposPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
    </>
  );
}
