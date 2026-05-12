import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import ProductGrid from "../components/ProductGrid";
import { useAuth } from "../context/AuthContext";
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
    badge: badgeByStatus[annonce.statut] || "Annonce"
  };
}

export default function PrivateHomePage() {
  const { user } = useAuth();
  const [publishedAnnonces, setPublishedAnnonces] = useState([]);
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategorie, setSearchCategorie] = useState("");
  const [searchPrixMax, setSearchPrixMax] = useState("");
  const [searchVille, setSearchVille] = useState("");
  const [filters, setFilters] = useState({ query: "", categorie: "", prixMax: "", ville: "" });
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError("");

        const [publishedResponse, mineResponse] = await Promise.all([
          api.get("/annonces", { params: { limit: 200 } }),
          api.get("/annonces/me", { params: { limit: 24 } })
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
  const myActiveCards = useMemo(
    () => myAnnonces.filter((annonce) => annonce.statut === "active").map(mapAnnonceToCard),
    [myAnnonces]
  );

  const filteredCards = useMemo(() => {
    if (!hasSearched) return null;
    const q = filters.query.toLowerCase().trim();
    const ville = filters.ville.toLowerCase().trim();
    const prixMax = filters.prixMax !== "" ? Number(filters.prixMax) : null;

    return publishedAnnonces
      .filter((a) => {
        if (q && !a.titre?.toLowerCase().includes(q) && !a.description?.toLowerCase().includes(q)) return false;
        if (filters.categorie && a.categorie !== filters.categorie) return false;
        if (prixMax !== null && Number(a.prix) > prixMax) return false;
        if (ville && !a.localisation?.toLowerCase().includes(ville)) return false;
        return true;
      })
      .map(mapAnnonceToCard);
  }, [filters, hasSearched, publishedAnnonces]);

  function handleSearch() {
    setFilters({ query: searchQuery, categorie: searchCategorie, prixMax: searchPrixMax, ville: searchVille });
    setHasSearched(true);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  function handleReset() {
    setSearchQuery("");
    setSearchCategorie("");
    setSearchPrixMax("");
    setSearchVille("");
    setFilters({ query: "", categorie: "", prixMax: "", ville: "" });
    setHasSearched(false);
  }

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main private-home-main">
        <section className="hero hero-private">
          <h1>Bonjour {user?.pseudo || "Martin"} !</h1>
          <p>Découvrez les meilleures affaires près de chez vous</p>
        </section>

        <section className="private-search-wrap">
          <div className="private-search">
            <input
              placeholder="Rechercher un objet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <select value={searchCategorie} onChange={(e) => setSearchCategorie(e.target.value)}>
              <option value="">Catégorie</option>
              <option value="meubles">Meubles</option>
              <option value="electronique">Électronique</option>
              <option value="mode">Mode</option>
              <option value="sport">Sport</option>
              <option value="jeux-loisirs">Jeux & Loisirs</option>
              <option value="autres">Autres</option>
            </select>
            <input
              placeholder="Prix max"
              type="number"
              min="0"
              value={searchPrixMax}
              onChange={(e) => setSearchPrixMax(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <input
              placeholder="Ville"
              value={searchVille}
              onChange={(e) => setSearchVille(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn btn-primary" onClick={handleSearch}>Rechercher</button>
          </div>
        </section>

        {hasSearched ? (
          <section className="section listings-section">
            <div className="section-head">
              <h2>Résultats ({filteredCards.length})</h2>
              <button className="btn btn-outline" onClick={handleReset}>Effacer</button>
            </div>
            {filteredCards.length === 0
              ? <p className="empty-listing-message">Aucune annonce ne correspond à votre recherche.</p>
              : <ProductGrid items={filteredCards} />
            }
          </section>
        ) : (
          <>
            <section className="section listings-section">
              <div className="section-head">
                <h2>Mes annonces en 1 clic</h2>
                <Link to="/mes-annonces" className="btn btn-outline">Voir tout</Link>
              </div>
              {isLoading ? <p className="center-loader">Chargement des annonces...</p> : null}
              {!isLoading && error ? <p className="form-error">{error}</p> : null}
              {!isLoading && !error ? <ProductGrid items={myActiveCards} showBadge /> : null}
            </section>

            <section className="section listings-section">
              <h2>Les meilleures annonces</h2>
              {isLoading ? null : !error ? <ProductGrid items={publishedCards} /> : null}
            </section>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}