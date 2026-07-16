import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PrivateHeader from "../components/PrivateHeader";
import PaginationControls from "../components/PaginationControls";
import ProductGrid from "../components/ProductGrid";
import SiteFooter from "../components/SiteFooter";
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

export default function MyAnnoncesPage() {
  const [annonces, setAnnonces] = useState([]);
  const [counts, setCounts] = useState({ active: 0, vendues: 0, brouillon: 0 });
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const statusByTab = {
    active: "active",
    vendues: "expirée",
    brouillon: "brouillon"
  };

  useEffect(() => {
    async function loadMyAnnonces() {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/annonces/me", {
          params: {
            limit: 10,
            page: currentPage,
            statut: statusByTab[activeTab]
          }
        });
        setAnnonces(response.data?.annonces || []);
        setCounts(response.data?.counts || { active: 0, vendues: 0, brouillon: 0 });
        setCurrentPage(Number(response.data?.page || 1));
        setTotalPages(Number(response.data?.pages || 1));
        setTotalItems(Number(response.data?.total || 0));
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger vos annonces.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMyAnnonces();
  }, [activeTab, currentPage]);

  const filteredCards = useMemo(() => {
    return annonces.map(mapAnnonceToCard);
  }, [annonces]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function goToPage(page) {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
  }

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main mes-annonces-page">
        <section className="mes-annonces-head">
          <div>
            <h1>Mes annonces</h1>
            <p>Gérer ici toutes vos annonces</p>
          </div>

          <Link to="/creer-annonce" className="btn btn-primary">
            Nouvelle annonce
          </Link>
        </section>

        <section className="mes-annonces-tabs" aria-label="Filtre statut annonces">
          <button
            type="button"
            className={"mes-tab" + (activeTab === "active" ? " active" : "")}
            onClick={() => handleTabChange("active")}
          >
            Actives ({counts.active})
          </button>
          <button
            type="button"
            className={"mes-tab" + (activeTab === "vendues" ? " active" : "")}
            onClick={() => handleTabChange("vendues")}
          >
            Vendues ({counts.vendues})
          </button>
          <button
            type="button"
            className={"mes-tab" + (activeTab === "brouillon" ? " active" : "")}
            onClick={() => handleTabChange("brouillon")}
          >
            Brouillons ({counts.brouillon})
          </button>
        </section>

        {isLoading ? <p className="center-loader">Chargement des annonces...</p> : null}
        {!isLoading && error ? <p className="form-error">{error}</p> : null}

        {!isLoading && !error ? (
          <section className="section listings-section mes-annonces-list">
            <div className="section-head">
              <h2>{activeTab === "active" ? "Annonces actives" : activeTab === "vendues" ? "Annonces vendues" : "Annonces brouillon"}</h2>
              <p>{totalItems} annonce(s)</p>
            </div>
            <ProductGrid items={filteredCards} showBadge />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => goToPage(currentPage - 1)}
              onNext={() => goToPage(currentPage + 1)}
            />
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}