import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage } from "react-icons/fa";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import api from "../services/api";

const CreateAnnonce = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    prix: "",
    categorie: "",
    localisation: "",
    statut: "active"
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [selectedImages]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);

    setSelectedImages((currentImages) => {
      currentImages.forEach((image) => URL.revokeObjectURL(image.preview));

      return files.map((file) => ({
        file,
        name: file.name,
        preview: URL.createObjectURL(file)
      }));
    });
  };

  const handleSubmit = async (action) => {
    try {
      setFeedback({ type: "", message: "" });
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("titre", formData.titre);
      payload.append("description", formData.description);
      payload.append("prix", formData.prix);
      payload.append("categorie", formData.categorie);
      payload.append("localisation", formData.localisation);
      payload.append("statut", action === "brouillon" ? "brouillon" : "active");

      selectedImages.forEach((image) => {
        if (image.file) {
          payload.append("images", image.file);
        }
      });

      await api.post("/annonces", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFeedback({ type: "success", message: "Annonce enregistrée !" });
      navigate("/app");
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Erreur lors de l'envoi"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main create-annonce-page">
        <section className="create-annonce-header">
          <h1>Créer une annonce</h1>
          <p>Remplissez les informations pour publier votre annonce.</p>
        </section>

        <section className="create-annonce-card create-annonce-photos-card">
          <h2>Photos</h2>
          <p className="create-annonce-card-subtitle">
            Ajouter jusqu&apos;à 5 photos à votre article
          </p>

          <input
            id="create-annonce-images"
            className="photo-upload-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

          <label htmlFor="create-annonce-images" className="photo-upload-box">
            <FaImage />
            <span>Ajouter</span>
          </label>

          {selectedImages.length ? (
            <div className="photo-preview-list">
              {selectedImages.map((image) => (
                <div key={image.name} className="photo-preview-item">
                  <img src={image.preview} alt={image.name} />
                  <span>{image.name}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="create-annonce-card">
          <div className="create-annonce-field">
            <label>Titre de l'annonce *</label>
            <input
              name="titre"
              value={formData.titre}
              placeholder="Ex: Canapé en cuir 3 places..."
              onChange={handleChange}
            />
          </div>

          <div className="create-annonce-field">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              placeholder="Décrivez votre article en détail..."
              onChange={handleChange}
            />
            <p className="create-annonce-help">Minimum 50 caractères</p>
          </div>

          <div className="create-annonce-grid">
            <div className="create-annonce-field">
              <label>Prix (€) *</label>
              <input name="prix" type="number" value={formData.prix} onChange={handleChange} />
            </div>

            <div className="create-annonce-field">
              <label>Catégorie *</label>
              <select name="categorie" value={formData.categorie} onChange={handleChange}>
                <option value="">Sélectionnez</option>
                <option value="meubles">Meubles</option>
                <option value="electronique">Électronique</option>
                <option value="mode">Mode</option>
                <option value="sport">Sport</option>
                <option value="jeux-loisirs">Jeux et loisirs</option>
              </select>
            </div>
          </div>
        </section>

        <section className="create-annonce-card">
          <div className="create-annonce-field">
            <label>Localisation</label>
            <input
              name="localisation"
              value={formData.localisation}
              placeholder="Paris 12ème"
              onChange={handleChange}
            />
            <p className="create-annonce-help">
              Votre adresse exacte ne sera jamais affichée publiquement
            </p>
          </div>
        </section>

        {feedback.message ? (
          <p className={feedback.type === "error" ? "form-error" : "form-success"}>
            {feedback.message}
          </p>
        ) : null}

        <div className="create-annonce-actions">
          <button className="btn btn-outline" type="button" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button
            className="btn btn-outline"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("brouillon")}
          >
            Enregistrer en brouillon
          </button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("publier")}
          >
            {isSubmitting ? "Publication..." : "Publier l'annonce"}
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default CreateAnnonce;