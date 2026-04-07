import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import ProductGrid from "../components/ProductGrid";
import { useAuth } from "../context/AuthContext";
import { products } from "../data/products";

export default function PrivateHomePage() {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main">
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

          <ProductGrid items={products.slice(0, 3)} showBadge />
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