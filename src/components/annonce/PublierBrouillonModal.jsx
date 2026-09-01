import { FaTimes } from "react-icons/fa";

export default function PublierAnnonceModal({
  onClose,
  onConfirm,
  open,
  isPublishing,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirmer la publication</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: "16px 0", color: "#4b5563" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>
            Êtes-vous sûr de vouloir publier cette annonce ?
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            Elle quittera le statut de brouillon et deviendra visible par l'ensemble des utilisateurs de DealSpot.
          </p>
        </div>

        <div className="modal-actions" style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "12px", 
          marginTop: "16px" 
        }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isPublishing}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: "#10b981", borderColor: "#10b981" }}
            onClick={onConfirm}
            disabled={isPublishing}
          >
            {isPublishing ? "Publication..." : "Oui, publier l'annonce"}
          </button>
        </div>
      </div>
    </div>
  );
}