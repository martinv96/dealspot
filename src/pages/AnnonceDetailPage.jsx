import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaMapMarkerAlt, FaRegCalendarAlt, FaTrashAlt, FaUserCircle, FaTimes, FaHeart, FaRegHeart, FaShareAlt, FaCommentDots, FaFlag } from "react-icons/fa";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PublicHeader from "../components/PublicHeader";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import api from "../services/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' font-family='Arial' font-size='36' fill='%23909090' text-anchor='middle' dominant-baseline='middle'>DealSpot</text></svg>";
const API_ORIGIN = "http://localhost:4000";
const DEFAULT_MAP_CENTER = [48.8566, 2.3522];

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center, 12, { animate: false });
  }, [center, map]);

  return null;
}

function formatPrice(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;
  return numberValue.toLocaleString("fr-FR");
}

function formatDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function cleanImages(rawImages) {
  if (!Array.isArray(rawImages) || rawImages.length === 0) {
    return [FALLBACK_IMAGE];
  }
  return rawImages
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => {
      if (value.startsWith("http") || value.startsWith("data:")) return value;
      return API_ORIGIN + (value.startsWith("/") ? "" : "/") + value;
    });
}

export default function AnnonceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [annonce, setAnnonce] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // États pour le formulaire d'édition
  const [editForm, setEditForm] = useState({
    titre: "",
    description: "",
    prix: "",
    categorie: "",
    localisation: "",
    statut: "active"
  });
  const [existingImagesToKeep, setExistingImagesToKeep] = useState([]);
  const [editFiles, setEditFiles] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapStatus, setMapStatus] = useState("idle");

  useEffect(() => {
    async function loadAnnonce() {
      try {
        setIsLoading(true);
        const response = await api.get("/annonces/" + id);
        const fetchedAnnonce = response.data?.annonce || null;
        setAnnonce(fetchedAnnonce);

        if (fetchedAnnonce) {
          setEditForm({
            titre: fetchedAnnonce.titre || "",
            description: fetchedAnnonce.description || "",
            prix: fetchedAnnonce.prix || "",
            categorie: fetchedAnnonce.categorie || "",
            localisation: fetchedAnnonce.localisation || "",
            statut: fetchedAnnonce.statut || "active"
          });
          setExistingImagesToKeep(fetchedAnnonce.images || []);
        }
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger cette annonce.");
      } finally {
        setIsLoading(false);
      }
    }
    loadAnnonce();
  }, [id]);

  // Les images affichées changent dynamiquement si on est en train d'éditer
  const currentImages = useMemo(() => {
    const list = isEditing ? existingImagesToKeep : (annonce?.images || []);
    return cleanImages(list);
  }, [annonce, isEditing, existingImagesToKeep]);

  useEffect(() => {
    if (activeImageIndex >= currentImages.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, currentImages.length]);

  const displayedLocalisation = (isEditing ? editForm.localisation : annonce?.localisation || "").trim();

  useEffect(() => {
    if (!displayedLocalisation) {
      setMapCenter(null);
      setMapStatus("empty");
      return;
    }

    const controller = new AbortController();
    setMapStatus("loading");
    const timeoutId = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(displayedLocalisation)}`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Accept-Language": "fr"
          }
        });

        if (!response.ok) {
          throw new Error("Echec geocodage");
        }

        const results = await response.json();
        if (!Array.isArray(results) || results.length === 0) {
          setMapCenter(null);
          setMapStatus("not-found");
          return;
        }

        const first = results[0];
        setMapCenter([Number(first.lat), Number(first.lon)]);
        setMapStatus("ok");
      } catch (geocodeError) {
        if (geocodeError?.name === "AbortError") {
          return;
        }
        setMapCenter(null);
        setMapStatus("error");
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [displayedLocalisation]);

  const isOwner = !!(isAuthenticated && user?.id && annonce?.user_id === user.id);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImagesToKeep((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  function handleCancelEdit() {
    setEditForm({
      titre: annonce.titre || "",
      description: annonce.description || "",
      prix: annonce.prix || "",
      categorie: annonce.categorie || "",
      localisation: annonce.localisation || "",
      statut: annonce.statut || "active"
    });
    setExistingImagesToKeep(annonce.images || []);
    setEditFiles([]);
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    try {
      setIsSaving(true);
      setError("");
      const payload = new FormData();
      Object.keys(editForm).forEach(key => payload.append(key, editForm[key]));
      
      // On envoie la liste des images conservées
      payload.append("existingImages", JSON.stringify(existingImagesToKeep));
      
      editFiles.forEach((file) => payload.append("images", file));

      const response = await api.put("/annonces/" + id, payload);
      setAnnonce(response.data.annonce);
      setExistingImagesToKeep(response.data.annonce.images || []);
      setEditFiles([]);
      setIsEditing(false);
    } catch {
      setError("Modification impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    try {
      setIsDeleting(true);
      await api.delete("/annonces/" + id);
      navigate("/mes-annonces", { replace: true });
    } catch {
      setError("Suppression impossible.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="page-shell">
      {isAuthenticated ? <PrivateHeader /> : <PublicHeader />}

      <main className="page-main annonce-detail-page">
        {isLoading ? (
          <p className="center-loader">Chargement...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : annonce ? (
          <>
            <section className="annonce-detail-breadcrumb">
              <Link to={isAuthenticated ? "/app" : "/"}>Accueil</Link>
              <span>/</span>
              <span>{annonce.categorie}</span>
              <span>/</span>
              <span>{annonce.titre}</span>
            </section>

            <section className="annonce-detail-grid">
              <div className="annonce-media-card">
                <div className="annonce-main-image-frame">
                  <img src={currentImages[activeImageIndex]} alt="Main" className="annonce-main-image" />
                </div>

                <div className="annonce-thumbs-row">
                  {currentImages.map((image, index) => (
                    <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        type="button"
                        className={"annonce-thumb" + (index === activeImageIndex ? " active" : "")}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img src={image} alt="miniature" />
                      </button>

                      {/* suppression */}
                      {isEditing && image !== FALLBACK_IMAGE && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveExistingImage(index);
                          }}
                          style={{
                            position: 'absolute', top: '-5px', right: '-5px',
                            background: 'red', color: 'white', border: 'none',
                            borderRadius: '50%', width: '18px', height: '18px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '10px', zIndex: 5
                          }}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="annonce-description-card">
                  <h3>Description</h3>
                  {isEditing ? (
                    <textarea name="description" value={editForm.description} onChange={handleEditChange} />
                  ) : (
                    <p>{annonce.description}</p>
                  )}
                </div>

                <div className="annonce-location-card">
                  <h3>Localisation</h3>
                  <div className="annonce-leaflet-wrap" aria-label="Carte de localisation de l'annonce">
                    <MapContainer
                      center={mapCenter || DEFAULT_MAP_CENTER}
                      zoom={12}
                      scrollWheelZoom={false}
                      className="annonce-leaflet-map"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {mapCenter ? (
                        <CircleMarker
                          center={mapCenter}
                          radius={10}
                          pathOptions={{ color: "#2f6fd6", fillColor: "#2f6fd6", fillOpacity: 0.28, weight: 2 }}
                        />
                      ) : null}
                      <RecenterMap center={mapCenter} />
                    </MapContainer>
                  </div>
                  <div className="annonce-location-note">
                    <strong>{displayedLocalisation || "Localisation non renseignee"}</strong>
                    <p>
                      {mapStatus === "loading" ? "Recherche de la zone..." : null}
                      {mapStatus === "not-found" ? "Zone introuvable. Verifiez la saisie." : null}
                      {mapStatus === "error" ? "Impossible de charger la carte pour le moment." : null}
                      {mapStatus === "ok" || mapStatus === "idle" || mapStatus === "empty"
                        ? "Remise en main propre a convenir entre acheteur et vendeur."
                        : null}
                    </p>
                  </div>
                </div>
              </div>

              <aside className="annonce-side-col">
                <div className="annonce-summary-card">
                  {isEditing ? (
                    <div className="annonce-edit-form">
                      <label>Titre</label>
                      <input name="titre" value={editForm.titre} onChange={handleEditChange} />
                      <label>Prix (€)</label>
                      <input name="prix" type="number" value={editForm.prix} onChange={handleEditChange} />
                      <label>Ajouter des photos</label>
                      <input type="file" multiple onChange={(e) => setEditFiles(Array.from(e.target.files))} />
                      
                      <div className="annonce-owner-actions" style={{ marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={handleSaveEdit} disabled={isSaving}>
                          {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button className="btn btn-outline" onClick={handleCancelEdit}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1>{annonce.titre}</h1>
                      <p className="annonce-price">{formatPrice(annonce.prix)} €</p>
                      {annonce.categorie && (
                        <span className="annonce-categorie-badge">{annonce.categorie}</span>
                      )}
                      <p className="annonce-meta"><FaMapMarkerAlt /> {annonce.localisation}</p>
                      <p className="annonce-meta"><FaRegCalendarAlt /> Publié le {formatDate(annonce.date_publication)}</p>

                      {!isOwner && isAuthenticated && (
                        <div className="annonce-visitor-actions">
                          <Link
                            to={`/messages?userId=${annonce.vendeur?.id}&annonceId=${annonce.id}&pseudo=${encodeURIComponent(
                              annonce.vendeur?.pseudo || "Utilisateur"
                            )}&annonceTitre=${encodeURIComponent(annonce.titre || "Annonce")}`}
                            className="btn btn-contact"
                          >
                            <FaCommentDots /> Contacter le vendeur
                          </Link>
                          <div className="annonce-visitor-secondary">
                            <button
                              className={"btn btn-outline" + (isFavorite(annonce.id) ? " btn-fav-active" : "")}
                              onClick={() => toggleFavorite(annonce)}
                            >
                              {isFavorite(annonce.id) ? <FaHeart /> : <FaRegHeart />}
                              {isFavorite(annonce.id) ? "Sauvegardé" : "Favoris"}
                            </button>
                            <button className="btn btn-outline"><FaShareAlt /> Partager</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {isOwner && !isEditing && (
                    <div className="annonce-owner-actions">
                      <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        <FaEdit /> Modifier
                      </button>
                      <button className="btn btn-outline" onClick={handleDelete} disabled={isDeleting}>
                        <FaTrashAlt /> {isDeleting ? "..." : "Supprimer"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="annonce-vendeur-card">
                  <h3>Vendeur</h3>
                  <div className="annonce-vendeur-row">
                    <FaUserCircle size={30} />
                    <div>
                      <strong>{annonce.vendeur?.pseudo || "Utilisateur"}</strong>
                      <p>Membre depuis {formatDate(annonce.vendeur?.date_inscription)}</p>
                    </div>
                  </div>
                  {!isOwner && isAuthenticated && (
                    <Link to={`/vendeurs/${annonce.vendeur?.id}`} className="btn btn-outline annonce-vendeur-profil">Voir le profil</Link>
                  )}
                </div>

                {!isOwner && isAuthenticated && (
                  <button className="annonce-signaler-btn">
                    <FaFlag /> Signaler cette annonce
                  </button>
                )}
              </aside>
            </section>
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}