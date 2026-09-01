import { FaTimes, FaCheckCircle } from "react-icons/fa";

export default function MarquerVenduAnnonceModal({
  onClose,
  onConfirm,
  open,
  isMarkingSold,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaCheckCircle style={{ color: "#3b82f6", fontSize: "18px" }} /> Marquer comme vendue
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: "16px 0", color: "#4b5563" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#111827" }}>
            Avez-vous vendu cet objet ?
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            L'annonce sera marqué comme étant <strong>"Vendue"</strong>. Les autres utilisateurs ne pourront plus vous contacter à son sujet.
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
            disabled={isMarkingSold}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: "#3b82f6", borderColor: "#3b82f6" }}
            onClick={onConfirm}
            disabled={isMarkingSold}
          >
            {isMarkingSold ? "Mise à jour..." : "Confirmer la vente"}
          </button>
        </div>
      </div>
    </div>
  );
}