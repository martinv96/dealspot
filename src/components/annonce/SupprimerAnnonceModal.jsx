import { FaTimes, FaTrashAlt } from "react-icons/fa";

export default function SupprimerAnnonceModal({
  onClose,
  onConfirm,
  open,
  isDeleting,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaTrashAlt style={{ color: "#ef4444", fontSize: "18px" }} /> Supprimer l'annonce
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: "16px 0", color: "#4b5563" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#111827" }}>
            Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            Cette action est irréversible. Toutes les données liées à votre annonce ainsi que ses photos seront immédiatement effacées de DealSpot.
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
            disabled={isDeleting}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: "#ef4444", borderColor: "#ef4444" }}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </div>
  );
}