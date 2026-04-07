import { FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";

export default function ProductGrid({ items, showBadge = false }) {
  return (
    <div className="listing-grid">
      {items.map((item) => (
        <article className="listing-card" key={item.id}>
          {showBadge && item.badge ? <div className="badge">{item.badge}</div> : null}

          <img src={item.image} alt={item.title} className="listing-image" />

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
        </article>
      ))}
    </div>
  );
}