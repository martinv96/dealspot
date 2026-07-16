import { FaTimes } from "react-icons/fa";

export default function SignalerAnnonceModal({
  onClose,
  onSubmit,
  open,
  signalerDesc,
  signalerError,
  signalerLoading,
  signalerMotif,
  signalerSuccess,
  setSignalerDesc,
  setSignalerMotif,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Signaler cette annonce</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <label className="form-label">Motif *</label>
          <select
            className="form-input"
            value={signalerMotif}
            onChange={(event) => setSignalerMotif(event.target.value)}
            required
          >
            <option value="">-- Choisir un motif --</option>
            <option value="arnaque">Arnaque / Fraude</option>
            <option value="contenu_inapproprie">Contenu inapproprié</option>
            <option value="doublon">Doublon</option>
            <option value="prix_abusif">Prix abusif</option>
            <option value="autre">Autre</option>
          </select>

          <label className="form-label">Description (optionnelle)</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Décrivez le problème..."
            value={signalerDesc}
            onChange={(event) => setSignalerDesc(event.target.value)}
          />

          {signalerError && <p className="form-error">{signalerError}</p>}
          {signalerSuccess && <p className="form-success">{signalerSuccess}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={signalerLoading || !signalerMotif}
          >
            {signalerLoading ? "Envoi..." : "Envoyer le signalement"}
          </button>
        </form>
      </div>
    </div>
  );
}
