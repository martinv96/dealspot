import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaUserCircle, FaMapMarkerAlt, FaRegCalendarAlt, FaFlag } from "react-icons/fa";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23909090' text-anchor='middle' dominant-baseline='middle'>DealSpot</text></svg>";
const API_ORIGIN = "http://localhost:4000";

function resolveImage(value) {
  if (!value) return FALLBACK_IMAGE;
  if (value.startsWith("http") || value.startsWith("data:")) return value;
  return API_ORIGIN + (value.startsWith("/") ? "" : "/") + value;
}

function formatMemberSince(dateValue) {
  if (!dateValue) return "—";
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(dateValue));
}

function formatDateShort(dateValue) {
  if (!dateValue) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(dateValue));
}

function formatPrice(value) {
  const n = Number(value);
  return Number.isNaN(n) ? value : n.toLocaleString("fr-FR");
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [annonces, setAnnonces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError("");
        const [userRes, annoncesRes] = await Promise.all([
          api.get("/auth/users/" + id),
          api.get("/annonces", { params: { userId: id, limit: 50 } })
        ]);
        setProfileUser(userRes.data?.user || null);
        setAnnonces(annoncesRes.data?.annonces || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Impossible de charger ce profil.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const breadcrumbHome = isAuthenticated ? "/app" : "/";

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main user-profile-page">
        {isLoading ? (
          <p className="center-loader">Chargement...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : profileUser ? (
          <>
            <nav className="annonce-detail-breadcrumb">
              <Link to={breadcrumbHome}>Accueil</Link>
              <span>/</span>
              <span>Profil de {profileUser.pseudo}</span>
            </nav>

            <div className="user-profile-layout">
              {/* Colonne gauche : carte profil */}
              <aside className="user-profile-sidebar">
                <div className="user-profile-card">
                  <div className="user-profile-avatar">
                    <FaUserCircle />
                  </div>
                  <h2 className="user-profile-name">{profileUser.pseudo}</h2>

                  <div className="user-profile-stats">
                    <div className="user-profile-stat-row">
                      <span className="user-profile-stat-label">Annonces actives</span>
                      <span className="user-profile-stat-value">{annonces.length}</span>
                    </div>
                    <div className="user-profile-stat-row">
                      <span className="user-profile-stat-label">Membre depuis</span>
                      <span className="user-profile-stat-value">{formatMemberSince(profileUser.date_inscription)}</span>
                    </div>
                    {profileUser.localisation && (
                      <div className="user-profile-stat-row">
                        <span className="user-profile-stat-label">Localisation</span>
                        <span className="user-profile-stat-value">{profileUser.localisation}</span>
                      </div>
                    )}
                  </div>

                  <button className="btn btn-contact user-profile-contact-btn">
                    Contacter {profileUser.pseudo}
                  </button>

                  <button className="user-profile-report-btn">
                    <FaFlag /> Signaler cet utilisateur
                  </button>
                </div>
              </aside>

              {/* Colonne droite : annonces */}
              <section className="user-profile-listings">
                <div className="user-profile-listings-head">
                  <h2>Annonces de {profileUser.pseudo}</h2>
                  <span className="user-profile-count">
                    {annonces.length} annonce{annonces.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {annonces.length === 0 ? (
                  <p className="empty-listing-message">Aucune annonce pour le moment.</p>
                ) : (
                  <div className="user-profile-grid">
                    {annonces.map((a) => {
                      const imgSrc = Array.isArray(a.images) && a.images.length > 0
                        ? resolveImage(a.images[0])
                        : FALLBACK_IMAGE;
                      return (
                        <Link to={"/annonces/" + a.id} key={a.id} className="user-profile-card-item">
                          <div className="user-profile-card-img">
                            <img src={imgSrc} alt={a.titre} />
                          </div>
                          <div className="user-profile-card-body">
                            <h3>{a.titre}</h3>
                            <p className="user-profile-card-price">{formatPrice(a.prix)} €</p>
                            <p className="user-profile-card-meta">
                              <FaMapMarkerAlt /> {a.localisation}
                            </p>
                            <p className="user-profile-card-meta">
                              <FaRegCalendarAlt /> {formatDateShort(a.date_publication)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
