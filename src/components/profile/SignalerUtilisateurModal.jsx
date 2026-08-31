import { FaTimes } from "react-icons/fa";

export default function SignalerUtilisateurModal({
  onClose,
  onSubmit,
  open,
  signalerMotif,
  signalerDesc,
  signalerError,
  signalerLoading,
  signalerSuccess,
  setSignalerMotif,
  setSignalerDesc,
  pseudo,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Signaler {pseudo}</h3>
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
            <option value="comportement_inapproprie">Comportement inapproprié</option>
            <option value="usurpation">Usurpation d'identité</option>
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
