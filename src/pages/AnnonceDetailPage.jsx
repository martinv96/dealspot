import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaTrashAlt,
  FaUserCircle,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaCommentDots,
  FaFlag,
} from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import PublicHeader from "../components/PublicHeader";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import AnnonceEditForm from "../components/annonce/AnnonceEditForm";
import AnnonceLocationCard from "../components/annonce/AnnonceLocationCard";
import SignalerAnnonceModal from "../components/annonce/SignalerAnnonceModal";
import { useAuth } from "../context/useAuth";
import { useAnnonceLocation } from "../hooks/useAnnonceLocation";
import { useFavorites } from "../hooks/useFavorites";
import api from "../services/api";
import {
  cleanImages,
  FALLBACK_IMAGE,
  formatDate,
  formatPrice,
} from "../utils/annonceDetail";

export default function AnnonceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [annonce, setAnnonce] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingSold, setIsMarkingSold] = useState(false);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  // ces états pilotent les retours visuels des actions asynchrones

  // ce bloc garde la version locale du formulaire pendant la modif
  const [editForm, setEditForm] = useState({
    titre: "",
    description: "",
    prix: "",
    categorie: "",
    localisation: "",
    statut: "active",
  });
  const [existingImagesToKeep, setExistingImagesToKeep] = useState([]);
  const [editFiles, setEditFiles] = useState([]);

  const [showSignalerModal, setShowSignalerModal] = useState(false);
  const [signalerMotif, setSignalerMotif] = useState("");
  const [signalerDesc, setSignalerDesc] = useState("");
  const [signalerLoading, setSignalerLoading] = useState(false);
  const [signalerSuccess, setSignalerSuccess] = useState("");
  const [signalerError, setSignalerError] = useState("");

  useEffect(() => {
    // on charge l'annonce au montage et quand l'id change
    async function loadAnnonce() {
      try {
        setIsLoading(true);
        const response = await api.get("/annonces/" + id);
        const fetchedAnnonce = response.data?.annonce || null;
        setAnnonce(fetchedAnnonce);

        if (fetchedAnnonce) {
          // préremplissage direct du formulaire d'édition avec les données existantes
          setEditForm({
            titre: fetchedAnnonce.titre || "",
            description: fetchedAnnonce.description || "",
            prix: fetchedAnnonce.prix || "",
            categorie: fetchedAnnonce.categorie || "",
            localisation: fetchedAnnonce.localisation || "",
            statut: fetchedAnnonce.statut || "active",
          });
          setExistingImagesToKeep(fetchedAnnonce.images || []);
        }
      } catch (loadError) {
        setError(
          loadError?.response?.data?.message ||
            "Impossible de charger cette annonce.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadAnnonce();
  }, [id]);

  // la galerie s'aligne automatiquement sur les images conservées pendant l'édition
  const currentImages = useMemo(() => {
    const list = isEditing ? existingImagesToKeep : annonce?.images || [];
    return cleanImages(list);
  }, [annonce, isEditing, existingImagesToKeep]);

  useEffect(() => {
    // si la liste d'images change, on évite un index actif hors bornes
    if (activeImageIndex >= currentImages.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, currentImages.length]);

  const { displayedLocalisation, locationSuggestions, mapCenter, mapStatus } =
    useAnnonceLocation({
      isEditing,
      localisationValue: isEditing
        ? editForm.localisation
        : annonce?.localisation,
    });

  const isOwner = !!(
    isAuthenticated &&
    user?.id &&
    annonce?.user_id === user.id
  );
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleRemoveExistingImage = (indexToRemove) => {
    // retire uniquement côté état local, la suppression réelle se fait au save
    setExistingImagesToKeep((prev) =>
      prev.filter((_, i) => i !== indexToRemove),
    );
  };

  function handleEditChange(event) {
    // un seul handler pour tous les champs du formulaire
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  function handleCancelEdit() {
    // annulation = retour complet à la valeur persistée de l'annonce
    setEditForm({
      titre: annonce.titre || "",
      description: annonce.description || "",
      prix: annonce.prix || "",
      categorie: annonce.categorie || "",
      localisation: annonce.localisation || "",
      statut: annonce.statut || "active",
    });
    setExistingImagesToKeep(annonce.images || []);
    setEditFiles([]);
    setIsEditing(false);
  }

  function handleShare() {
    // copie l'url actuelle puis affiche un feedback court
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  }

  async function handleSaveEdit() {
    try {
      // le payload mixe texte + fichiers pour rester compatible upload d'images
      setIsSaving(true);
      setError("");
      const payload = new FormData();
      Object.keys(editForm).forEach((key) =>
        payload.append(key, editForm[key]),
      );

      // on envoie la liste des images gardées pour éviter de supprimer trop de photos côté api
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
    // sécurité ui: confirmation avant suppression définitive
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

  async function handleMarkAsSold() {
    // passage au statut expirée pour signaler la vente sans supprimer l'annonce
    if (!annonce?.id || annonce.statut === "expirée") return;
    if (!window.confirm("Marquer cette annonce comme vendue ?")) return;

    try {
      setIsMarkingSold(true);
      setError("");
      const response = await api.put("/annonces/" + id, {
        statut: "expirée",
      });

      const updatedAnnonce = response.data?.annonce || null;
      if (updatedAnnonce) {
        setAnnonce(updatedAnnonce);
        setEditForm((prev) => ({
          ...prev,
          statut: updatedAnnonce.statut || prev.statut,
        }));
      }
    } catch (markError) {
      setError(
        markError?.response?.data?.message ||
          "Impossible de marquer l'annonce comme vendue.",
      );
    } finally {
      setIsMarkingSold(false);
    }
  }

  // gestion changment statut annonce brouillon
  const [isPublishing, setIsPublishing] = useState(false);

  async function handlePublishAnnonce() {
    if (!annonce?.id || annonce.statut !== "brouillon") return;
    if (
      !window.confirm("Publier cette annonce pour la rendre visible de tous ?")
    )
      return;

    try {
      setIsPublishing(true);
      setError("");

      // Appel de la méthode dédiée du Back-end
      const response = await api.patch(`/annonces/${id}/publish`);
      const updatedAnnonce = response.data?.annonce || null;

      if (updatedAnnonce) {
        setAnnonce(updatedAnnonce);
        setEditForm((prev) => ({
          ...prev,
          statut: updatedAnnonce.statut || prev.statut,
        }));
      }
    } catch (publishError) {
      setError(
        publishError?.response?.data?.message ||
          "Impossible de publier l'annonce.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleSignaler(e) {
    // envoi du signalement depuis la modale avec reset automatique après succès
    e.preventDefault();
    setSignalerLoading(true);
    setSignalerError("");
    setSignalerSuccess("");
    try {
      await api.post("/reports", {
        annonce_id: annonce.id,
        motif: signalerMotif,
        description: signalerDesc,
      });
      setSignalerSuccess("Signalement envoyé. Merci !");
      setTimeout(() => {
        setShowSignalerModal(false);
        setSignalerMotif("");
        setSignalerDesc("");
        setSignalerSuccess("");
      }, 2000);
    } catch (err) {
      setSignalerError(
        err?.response?.data?.message || "Erreur lors du signalement.",
      );
    } finally {
      setSignalerLoading(false);
    }
  }

  return (
    <div className="page-shell">
      {isAuthenticated ? <PrivateHeader /> : <PublicHeader />}

      <main className="page-main annonce-detail-page">
        {/* chargement / erreur / contenu */}
        {isLoading ? (
          <p className="center-loader">Chargement...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : annonce ? (
          <>
            <section className="annonce-detail-breadcrumb">
              <Link to="/">Accueil</Link>
              <span>/</span>
              <span>{annonce.categorie}</span>
              <span>/</span>
              <span>{annonce.titre}</span>
            </section>

            <section className="annonce-detail-grid">
              {/* colonne media: image principale, miniatures, description, localisation */}
              <div className="annonce-media-card">
                <div className="annonce-main-image-frame">
                  <img
                    src={currentImages[activeImageIndex]}
                    alt="Main"
                    className="annonce-main-image"
                  />
                </div>

                <div className="annonce-thumbs-row">
                  {currentImages.map((image, index) => (
                    <div
                      key={index}
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <button
                        type="button"
                        className={
                          "annonce-thumb" +
                          (index === activeImageIndex ? " active" : "")
                        }
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
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            zIndex: 5,
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
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <p>{annonce.description}</p>
                  )}
                </div>

                <AnnonceLocationCard
                  displayedLocalisation={displayedLocalisation}
                  mapCenter={mapCenter}
                  mapStatus={mapStatus}
                />
              </div>

              <aside className="annonce-side-col">
                {/* colonne droite: résumé, actions, vendeur */}
                <div className="annonce-summary-card">
                  {isEditing ? (
                    <AnnonceEditForm
                      editForm={editForm}
                      isSaving={isSaving}
                      locationSuggestions={locationSuggestions}
                      onCancel={handleCancelEdit}
                      onEditChange={handleEditChange}
                      onFilesChange={(files) =>
                        setEditFiles(Array.from(files || []))
                      }
                      onSave={handleSaveEdit}
                    />
                  ) : (
                    <>
                      <h1>{annonce.titre}</h1>
                      <p className="annonce-price">
                        {formatPrice(annonce.prix)} €
                      </p>
                      {annonce.categorie && (
                        <span className="annonce-categorie-badge">
                          {annonce.categorie}
                        </span>
                      )}
                      {annonce.statut === "expirée" ? (
                        <p
                          className="annonce-meta"
                          style={{ fontWeight: 700, color: "#d55353" }}
                        >
                          Statut: Vendue
                        </p>
                      ) : null}
                      <p className="annonce-meta">
                        <FaMapMarkerAlt /> {annonce.localisation}
                      </p>
                      <p className="annonce-meta">
                        <FaRegCalendarAlt /> Publié le{" "}
                        {formatDate(annonce.date_publication)}
                      </p>

                      {!isOwner && isAuthenticated && (
                        <div className="annonce-visitor-actions">
                          <Link
                            to={`/messages?userId=${annonce.vendeur?.id}&annonceId=${annonce.id}&pseudo=${encodeURIComponent(
                              annonce.vendeur?.pseudo || "Utilisateur",
                            )}&annonceTitre=${encodeURIComponent(annonce.titre || "Annonce")}`}
                            className="btn btn-contact"
                          >
                            <FaCommentDots /> Contacter le vendeur
                          </Link>
                          <div className="annonce-visitor-secondary">
                            <button
                              className={
                                "btn btn-outline" +
                                (isFavorite(annonce.id)
                                  ? " btn-fav-active"
                                  : "")
                              }
                              onClick={() => toggleFavorite(annonce)}
                            >
                              {isFavorite(annonce.id) ? (
                                <FaHeart />
                              ) : (
                                <FaRegHeart />
                              )}
                              {isFavorite(annonce.id)
                                ? "Sauvegardé"
                                : "Favoris"}
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={handleShare}
                            >
                              <FaShareAlt />{" "}
                              {shareCopied ? "Lien copié !" : "Partager"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {isOwner && !isEditing && annonce.statut === "brouillon" && (
                    <div
                      className="annonce-draft-alert-box"
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fef3c7",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: "#92400e",
                            margin: 0,
                          }}
                        >
                          Cette annonce est un brouillon
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#b45309",
                            margin: "4px 0 0 0",
                          }}
                        >
                          Elle n'est visible que par vous.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          background: "#10b981",
                          borderColor: "#10b981",
                          width: "100%",
                        }}
                        onClick={handlePublishAnnonce}
                        disabled={isPublishing}
                      >
                        {isPublishing ? "Publication..." : "Publier l'annonce"}
                      </button>
                    </div>
                  )}
                  {isOwner && !isEditing && (
                    <div className="annonce-owner-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                        disabled={annonce.statut === "expirée"}
                      >
                        <FaEdit /> Modifier
                      </button>
                      {annonce.statut !== "expirée" ? (
                        <button
                          className="btn btn-outline"
                          onClick={handleMarkAsSold}
                          disabled={isMarkingSold}
                        >
                          {isMarkingSold
                            ? "Mise à jour..."
                            : "Marquer comme vendue"}
                        </button>
                      ) : null}
                      <button
                        className="btn btn-outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
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
                      <strong>
                        {annonce.vendeur?.pseudo || "Utilisateur"}
                      </strong>
                      <p>
                        Membre depuis{" "}
                        {formatDate(annonce.vendeur?.date_inscription)}
                      </p>
                    </div>
                  </div>
                  {!isOwner && isAuthenticated && (
                    <Link
                      to={`/vendeurs/${annonce.vendeur?.id}`}
                      className="btn btn-outline annonce-vendeur-profil"
                    >
                      Voir le profil
                    </Link>
                  )}
                </div>

                {!isOwner && isAuthenticated && (
                  <button
                    className="btn btn-outline btn-signaler"
                    onClick={() => setShowSignalerModal(true)}
                  >
                    <FaFlag /> Signaler
                  </button>
                )}
              </aside>
            </section>
          </>
        ) : null}

        <SignalerAnnonceModal
          open={showSignalerModal}
          onClose={() => setShowSignalerModal(false)}
          onSubmit={handleSignaler}
          signalerDesc={signalerDesc}
          signalerError={signalerError}
          signalerLoading={signalerLoading}
          signalerMotif={signalerMotif}
          signalerSuccess={signalerSuccess}
          setSignalerDesc={setSignalerDesc}
          setSignalerMotif={setSignalerMotif}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
