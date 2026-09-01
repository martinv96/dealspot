import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CategoryExplorerSection from "../components/CategoryExplorerSection";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import ProductGrid from "../components/ProductGrid";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

function formatPrice(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return value;
  }
  return numberValue.toLocaleString("fr-FR");
}

function formatRelativeDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  const now = Date.now();
  const diffInDays = Math.max(0, Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24)));

  if (diffInDays <= 0) {
    return "Aujourd'hui";
  }
  if (diffInDays === 1) {
    return "Il y a 1 jour";
  }
  return "Il y a " + diffInDays + " jours";
}

function mapAnnonceToCard(annonce) {
  const badgeByStatus = {
    active: "Publiée",
    "expirée": "Vendue",
    brouillon: "Brouillon"
  };

  return {
    id: annonce.id,
    title: annonce.titre,
    price: formatPrice(annonce.prix),
    city: annonce.localisation || "Non précisée",
    date: formatRelativeDate(annonce.date_publication),
    images: Array.isArray(annonce.images) ? annonce.images : [],
    badge: badgeByStatus[annonce.statut] || "Annonce",
    badgeStatus: annonce.statut
  };
}

export default function PrivateHomePage() {
  const { user } = useAuth();
  const [publishedAnnonces, setPublishedAnnonces] = useState([]);
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError("");

        const [publishedResponse, mineResponse] = await Promise.all([
          api.get("/annonces", { params: { limit: 6, page: 1 } }),
          api.get("/annonces/me", { params: { limit: 6, page: 1, statut: "active" } })
        ]);

        setPublishedAnnonces(publishedResponse.data?.annonces || []);
        setMyAnnonces(mineResponse.data?.annonces || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger le tableau de bord.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const publishedCards = useMemo(
    () => publishedAnnonces.map(mapAnnonceToCard),
    [publishedAnnonces]
  );
  const filteredPublishedCards = useMemo(() => {
    if (!selectedCategory) {
      return publishedCards;
    }

    return publishedCards.filter((card) => {
      const annonce = publishedAnnonces.find((item) => item.id === card.id);
      return annonce && annonce.categorie === selectedCategory;
    });
  }, [publishedAnnonces, publishedCards, selectedCategory]);
  const myActiveCards = useMemo(
    () => myAnnonces.map(mapAnnonceToCard),
    [myAnnonces]
  );

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main private-home-main">
        <section className="hero hero-private">
          <h1>Bonjour {user?.pseudo || "Mystérieux inconnu"} !</h1>
          <p>Découvrez les annonces du site près de chez vous</p>
        </section>


        <section className="section listings-section">
          <div className="section-head">
            <h2>Mes annonces en 1 clic</h2>
            <Link to="/mes-annonces" className="btn btn-outline">Toutes mes annonces</Link>
          </div>
          {isLoading ? <p className="center-loader">Chargement des annonces...</p> : null}
          {!isLoading && error ? <p className="form-error">{error}</p> : null}
          {!isLoading && !error ? <ProductGrid items={myActiveCards} showBadge /> : null}
        </section>

        <CategoryExplorerSection selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <section className="section listings-section">
          <div className="section-head">
            <h2>Annonces du site</h2>
            <Link to="/annonces" className="btn btn-outline">Voir tout</Link>
          </div>
          {isLoading ? null : !error ? <ProductGrid items={filteredPublishedCards} /> : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}