import {
  FaCouch,
  FaBlender,
  FaTshirt,
  FaFutbol,
  FaGamepad,
  FaDesktop,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaPercent
} from "react-icons/fa";

const categories = [
  { icon: <FaCouch />, label: "Meubles" },
  { icon: <FaBlender />, label: "Electroménager" },
  { icon: <FaTshirt />, label: "Mode" },
  { icon: <FaFutbol />, label: "Sport" },
  { icon: <FaGamepad />, label: "Jeux & Loisirs" },
  { icon: <FaDesktop />, label: "Electronique" },
  { icon: <FaBoxOpen />, label: "Autres" }
];

const listings = [
  {
    id: 1,
    title: "Canapé vintage en velours bleu",
    price: 450,
    city: "Paris 11e",
    date: "Il y a 2 jours",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    title: "Canapé vintage en velours bleu",
    price: 450,
    city: "Paris 11e",
    date: "Il y a 2 jours",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    title: "Canapé vintage en velours bleu",
    price: 450,
    city: "Paris 11e",
    date: "Il y a 2 jours",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
  }
];

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <FaPercent />
          </div>
          <span>DealSpot</span>
        </div>

        <nav className="nav">
          <a href="#accueil" className="nav-link active">
            Accueil
          </a>
          <button className="btn btn-outline">Connexion</button>
          <button className="btn btn-primary">Inscription</button>
        </nav>
      </header>

      <section className="hero" id="accueil">
        <h1>Achetez et vendez vos produits, localement</h1>
        <p>
          DealSpot est la plateforme de revente d’objets d’occasion près de chez
          vous. Donnez une seconde vie à vos objets !
        </p>
        <button className="btn btn-hero">
          Voir les annonces !
          <span className="arrow">→</span>
        </button>
      </section>

      <main>
        <section className="section categories-section">
          <h2>Explorer par catégorie</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <button className="category-card" key={category.label}>
                <span className="category-icon">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section listings-section">
          <div className="section-head">
            <h2>Annonces récentes</h2>
            <button className="btn btn-outline">
              Voir tout <span className="arrow">→</span>
            </button>
          </div>

          <div className="listing-grid">
            {listings.map((item) => (
              <article className="listing-card" key={item.id}>
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
        </section>

        <section className="cta">
          <h2>Prêt à vendre ?</h2>
          <p>
            Rejoignez nous chez DealSpot pour vendre et acheter en toute sécurité.
          </p>
          <div className="cta-actions">
            <button className="btn btn-white">Créer un compte</button>
            <button className="btn btn-white">Se connecter</button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-cols">
          <div>
            <div className="brand footer-brand">
              <div className="brand-icon">
                <FaPercent />
              </div>
              <span>DealSpot</span>
            </div>
            <p className="footer-text">
              La plateforme de revente locale d’objets d’occasion.
              <br />
              Simple, rapide et sécurisée.
            </p>
          </div>

          <div>
            <h4>Liens rapide</h4>
            <ul>
              <li>Accueil</li>
              <li>A propos</li>
              <li>Aide</li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>Email : contact@email.fr</li>
              <li>Tel : 06 54 86 78 58</li>
            </ul>
          </div>
        </div>

        <p className="copyright">© 2026 DealSpot. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default App;