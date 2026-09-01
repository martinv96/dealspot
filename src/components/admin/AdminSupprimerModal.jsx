import { FaTimes, FaTrashAlt } from "react-icons/fa";

export default function AdminSupprimerModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  isDeleting = false,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <FaTrashAlt style={{ color: "#ef4444", fontSize: "18px" }} /> {title}
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: "16px 0", color: "#4b5563" }}>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
            {message}
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
            style={{ background: "#ef4444", borderColor: "#ef4444", color: "#fff" }}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}