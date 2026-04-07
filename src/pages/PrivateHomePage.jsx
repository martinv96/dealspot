import {
  FaMapMarkerAlt,
  FaRegCalendarAlt
} from "react-icons/fa";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";

const cards = [
  {
    id: 1,
    title: "Canapé vintage en velours bleu",
    price: 450,
    city: "Paris 11e",
    date: "Il y a 2 jours",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    badge: "Active"
  },
  {
    id: 2,
    title: "Chaise moderne couleur bois",
    price: 45,
    city: "Paris 11e",
    date: "Il y a 4 jours",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=900&q=80",
    badge: "Vendu"
  },
  {
    id: 3,
    title: "Velo",
    price: 60,
    city: "Paris 11e",
    date: "Il y a 6 jours",
    image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=900&q=80",
    badge: "Brouillon"
  }
];

export default function PrivateHomePage() {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <PrivateHeader />

      <section className="hero hero-private">
        <h1>Bonjour {user?.pseudo || "Martin"} !</h1>
        <p>Découvrez les meilleures affaires près de chez vous</p>
      </section>

      <section className="private-search-wrap">
        <div className="private-search">
          <input placeholder="Rechercher un objet..." />
          <select>
            <option>Catégorie</option>
          </select>
          <input placeholder="Prix max" />
          <input placeholder="Ville" />
          <button className="btn btn-primary">Rechercher</button>
        </div>
      </section>

      <section className="section listings-section">
        <div className="section-head">
          <h2>Mes annonces en 1 clic</h2>
          <button className="btn btn-outline">Voir tout</button>
        </div>

        <div className="listing-grid">
          {cards.map((item) => (
            <article className="listing-card" key={item.id}>
              <div className="badge">{item.badge}</div>
              <img src={item.image} alt={item.title} className="listing-image" />
              <div className="listing-content">
                <h3>{item.title}</h3>
                <p className="price">{item.price} €</p>
                <p className="meta"><FaMapMarkerAlt /> {item.city}</p>
                <p className="meta"><FaRegCalendarAlt /> {item.date}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section listings-section">
        <h2>Les meilleures annonces</h2>
        <div className="listing-grid">
          {cards.map((item) => (
            <article className="listing-card" key={"best-" + item.id}>
              <img src={item.image} alt={item.title} className="listing-image" />
              <div className="listing-content">
                <h3>{item.title}</h3>
                <p className="price">{item.price} €</p>
                <p className="meta"><FaMapMarkerAlt /> {item.city}</p>
                <p className="meta"><FaRegCalendarAlt /> {item.date}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}