import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import ProductGrid from "../components/ProductGrid";
import { products } from "../data/products";

export default function HomePage() {
  return (
    <div className="page-shell">
      <PublicHeader />

      <main className="page-main">
        <section className="hero">
          <h1>Achetez et vendez vos produits, localement</h1>
          <p>
            DealSpot est la plateforme de revente d'objets d'occasion près de chez vous.
            Donnez une seconde vie à vos objets.
          </p>

          <div className="hero-actions">
            <Link to="/inscription" className="btn btn-white-hero">
              Créer un compte
            </Link>
            <Link to="/connexion" className="btn btn-white-hero">
              Se connecter
            </Link>
          </div>
        </section>

        <section className="section listings-section">
          <div className="section-head">
            <h2>Annonces récentes</h2>
            <button className="btn btn-outline">Voir tout</button>
          </div>

          <ProductGrid items={products.slice(0, 3)} />
        </section>

        <section className="section listings-section">
          <h2>Les meilleures annonces</h2>
          <ProductGrid items={products} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}