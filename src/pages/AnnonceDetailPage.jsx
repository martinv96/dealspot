import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaMapMarkerAlt, FaRegCalendarAlt, FaTrashAlt, FaUserCircle } from "react-icons/fa";
import PublicHeader from "../components/PublicHeader";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' font-family='Arial' font-size='36' fill='%23909090' text-anchor='middle' dominant-baseline='middle'>DealSpot</text></svg>";
const API_ORIGIN = "http://localhost:4000";

function formatPrice(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return value;
  }
  return numberValue.toLocaleString("fr-FR");
}

function formatDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }
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

  const filtered = rawImages
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => {
      if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
        return value;
      }
      if (value.startsWith("/uploads/")) {
        return API_ORIGIN + value;
      }
      return value;
    });

  return filtered.length > 0 ? filtered : [FALLBACK_IMAGE];
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
  const [editForm, setEditForm] = useState({
    titre: "",
    description: "",
    prix: "",
    categorie: "",
    localisation: "",
    statut: "active"
  });
  const [editFiles, setEditFiles] = useState([]);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadAnnonce() {
      try {
        setIsLoading(true);
        setError("");
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
        }
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger cette annonce.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnnonce();
  }, [id]);

  const images = useMemo(() => cleanImages(annonce?.images), [annonce?.images]);

  useEffect(() => {
    if (activeImageIndex >= images.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, images.length]);

  const isOwner = !!(isAuthenticated && user?.id && annonce?.user_id === user.id);

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  function handleEditFileChange(event) {
    const files = Array.from(event.target.files || []).slice(0, 5);
    setEditFiles(files);
  }

  function handleCancelEdit() {
    if (!annonce) {
      return;
    }

    setEditForm({
      titre: annonce.titre || "",
      description: annonce.description || "",
      prix: annonce.prix || "",
      categorie: annonce.categorie || "",
      localisation: annonce.localisation || "",
      statut: annonce.statut || "active"
    });
    setEditFiles([]);
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    if (!isOwner || !annonce) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = new FormData();
      payload.append("titre", editForm.titre);
      payload.append("description", editForm.description);
      payload.append("prix", editForm.prix);
      payload.append("categorie", editForm.categorie);
      payload.append("localisation", editForm.localisation);
      payload.append("statut", editForm.statut);

      editFiles.forEach((file) => {
        payload.append("images", file);
      });

      const response = await api.put("/annonces/" + annonce.id, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const updatedAnnonce = response.data?.annonce;
      if (updatedAnnonce) {
        setAnnonce(updatedAnnonce);
      }
      setEditFiles([]);
      setActiveImageIndex(0);
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Modification impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!isOwner || !annonce) {
      return;
    }

    const confirmDelete = window.confirm("Supprimer cette annonce ? Cette action est définitive.");
    if (!confirmDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete("/annonces/" + annonce.id);
      navigate("/mes-annonces", { replace: true });
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || "Suppression impossible.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="page-shell">
      {isAuthenticated ? <PrivateHeader /> : <PublicHeader />}

      <main className="page-main annonce-detail-page">
        {isLoading ? <p className="center-loader">Chargement de l'annonce...</p> : null}
        {!isLoading && error ? <p className="form-error">{error}</p> : null}

        {!isLoading && !error && annonce ? (
          <>
            <section className="annonce-detail-breadcrumb">
              <Link to={isAuthenticated ? "/app" : "/"}>Accueil</Link>
              <span>/</span>
              <span>{annonce.categorie || "Catégorie"}</span>
              <span>/</span>
              <span>{annonce.titre}</span>
            </section>

            <section className="annonce-detail-grid">
              <div className="annonce-media-card">
                <img
                  src={images[activeImageIndex] || FALLBACK_IMAGE}
                  alt={annonce.titre}
                  className="annonce-main-image"
                />

                <div className="annonce-thumbs-row">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      className={"annonce-thumb" + (index === activeImageIndex ? " active" : "")}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img src={image} alt={annonce.titre + " visuel " + (index + 1)} />
                    </button>
                  ))}
                </div>

                <div className="annonce-description-card">
                  <h3>Description</h3>
                  <p>{annonce.description}</p>
                </div>
              </div>

              <aside className="annonce-side-col">
                <div className="annonce-summary-card">
                  {isOwner && isEditing ? (
                    <div className="annonce-edit-form">
                      <label>Titre</label>
                      <input name="titre" value={editForm.titre} onChange={handleEditChange} />

                      <label>Description</label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                      />

                      <label>Prix</label>
                      <input name="prix" type="number" value={editForm.prix} onChange={handleEditChange} />

                      <label>Catégorie</label>
                      <input name="categorie" value={editForm.categorie} onChange={handleEditChange} />

                      <label>Localisation</label>
                      <input
                        name="localisation"
                        value={editForm.localisation}
                        onChange={handleEditChange}
                      />

                      <label>Statut</label>
                      <select name="statut" value={editForm.statut} onChange={handleEditChange}>
                        <option value="active">Active</option>
                        <option value="expirée">Vendue</option>
                        <option value="brouillon">Brouillon</option>
                      </select>

                      <label>Nouvelles photos (optionnel, remplace les anciennes)</label>
                      <input type="file" accept="image/*" multiple onChange={handleEditFileChange} />

                      <div className="annonce-owner-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={isSaving}
                          onClick={handleSaveEdit}
                        >
                          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1>{annonce.titre}</h1>
                      <p className="annonce-price">{formatPrice(annonce.prix)} €</p>
                      <p className="annonce-meta"><FaMapMarkerAlt /> {annonce.localisation || "Non précisée"}</p>
                      <p className="annonce-meta"><FaRegCalendarAlt /> Publiée le {formatDate(annonce.date_publication)}</p>
                    </>
                  )}

                  {isOwner ? (
                    <div className="annonce-owner-actions">
                      {!isEditing ? (
                        <button
                          type="button"
                          className="btn btn-primary annonce-edit-btn"
                          onClick={() => setIsEditing(true)}
                        >
                          <FaEdit /> Modifier l'annonce
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="btn btn-outline annonce-delete-btn"
                        disabled={isDeleting || isEditing}
                        onClick={handleDelete}
                      >
                        <FaTrashAlt /> {isDeleting ? "Suppression..." : "Supprimer l'annonce"}
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn-primary" disabled>
                      Contacter le vendeur
                    </button>
                  )}
                </div>

                <div className="annonce-vendeur-card">
                  <h3>Vendeur</h3>
                  <div className="annonce-vendeur-row">
                    <FaUserCircle />
                    <div>
                      <strong>{annonce.vendeur?.pseudo || "Utilisateur DealSpot"}</strong>
                      <p>Membre depuis {formatDate(annonce.vendeur?.date_inscription)}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}