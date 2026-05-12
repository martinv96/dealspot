import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useFavorites } from "../hooks/useFavorites";

const API_ORIGIN = "http://localhost:4000";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23909090' text-anchor='middle' dominant-baseline='middle'>DealSpot</text></svg>";

function resolveImage(value) {
  if (!value) return FALLBACK_IMAGE;
  if (value.startsWith("http") || value.startsWith("data:")) return value;
  return API_ORIGIN + (value.startsWith("/") ? "" : "/") + value;
}

function formatPrice(value) {
  const n = Number(value);
  return Number.isNaN(n) ? value : n.toLocaleString("fr-FR");
}

function formatDateShort(dateValue) {
  if (!dateValue) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(dateValue));
}

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main favorites-page">
        <div className="favorites-head">
          <h1><FaHeart className="favorites-head-icon" /> Mes favoris</h1>
          <p>Retrouvez toutes les annonces que vous avez sauvegardées</p>
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <FaHeart className="favorites-empty-icon" />
            <p>Vous n'avez pas encore de favoris.</p>
            <Link to="/app" className="btn btn-primary">Explorer les annonces</Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((item) => {
              const imgSrc = Array.isArray(item.images) && item.images.length > 0
                ? resolveImage(item.images[0])
                : FALLBACK_IMAGE;
              return (
                <article key={item.id} className="favorites-card">
                  <Link to={"/annonces/" + item.id} className="favorites-card-img-wrap">
                    <img src={imgSrc} alt={item.titre} />
                    <button
                      type="button"
                      className="favorites-heart-btn active"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(item.id);
                      }}
                      title="Retirer des favoris"
                    >
                      <FaHeart />
                    </button>
                  </Link>

                  <Link to={"/annonces/" + item.id} className="favorites-card-body">
                    <h3>{item.titre}</h3>
                    <p className="favorites-card-price">{formatPrice(item.prix)} €</p>
                    <p className="favorites-card-meta"><FaMapMarkerAlt /> {item.localisation}</p>
                    <p className="favorites-card-meta"><FaRegCalendarAlt /> {formatDateShort(item.date_publication)}</p>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
