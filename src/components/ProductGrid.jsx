import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23909090' text-anchor='middle' dominant-baseline='middle'>DealSpot</text></svg>";
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");

function resolveImageUrl(value) {
  if (!value) {
    return FALLBACK_IMAGE;
  }

  if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(value)) {
      const normalizedPath = value.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
      return API_ORIGIN + normalizedPath;
    }
    return value;
  }

  if (typeof value === "string" && value.startsWith("/uploads/")) {
    return API_ORIGIN + value;
  }

  if (typeof value === "string" && value.startsWith("uploads/")) {
    return API_ORIGIN + "/" + value;
  }

  return value;
}

function getImageSource(item) {
  if (item.image) {
    return resolveImageUrl(item.image);
  }

  if (Array.isArray(item.images) && item.images.length > 0) {
    return resolveImageUrl(item.images[0]);
  }

  return FALLBACK_IMAGE;
}

function getBadgeClass(item) {
  const status = String(item?.badgeStatus || "").toLowerCase();
  const label = String(item?.badge || "").toLowerCase();

  if (status === "active" || label.includes("publi")) {
    return "badge badge--active";
  }

  if (status === "expirée" || status === "expiree" || label.includes("vend")) {
    return "badge badge--sold";
  }

  if (status === "brouillon" || label.includes("brouillon")) {
    return "badge badge--draft";
  }

  return "badge";
}

export default function ProductGrid({ items, showBadge = false }) {
  if (!items || items.length === 0) {
    return <p className="empty-listing-message">Aucune annonce disponible pour le moment.</p>;
  }

  return (
    <div className="listing-grid">
      {items.map((item) => (
        <article className="listing-card" key={item.id}>
          {showBadge && item.badge ? <div className={getBadgeClass(item)}>{item.badge}</div> : null}

          <Link to={"/annonces/" + item.id} className="listing-card-link">
            <img src={getImageSource(item)} alt={item.title} className="listing-image" />

            <div className="listing-content">
              <h3>{item.title}</h3>
              <p className="price">{item.price} €</p>
              <p className="meta">
                <FaMapMarkerAlt /> {item.city}
              </p>
              <p className="meta">
                <FaRegCalendarAlt /> {item.date}
              </p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}