import { useState } from "react";
import { FaTimes, FaBan } from "react-icons/fa";

export default function AdminBlockUserModal({
  open,
  onClose,
  onConfirm,
  user,
}) {
  const [reason, setReason] = useState("Non-respect des règles");

  if (!open || !user) return null;

  const isBlocking = !user.is_blocked;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(user, reason);
  };

  // On crée une fonction locale pour réinitialiser le champ texte 
  // proprement lorsque l'administrateur clique sur Annuler ou Fermer
  const handleCloseAndReset = () => {
    setReason("Non-respect des règles");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseAndReset}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <FaBan style={{ color: isBlocking ? "#ef4444" : "#3b82f6", fontSize: "18px" }} />
            {isBlocking ? "Bloquer l'utilisateur" : "Débloquer l'utilisateur"}
          </h3>
          <button type="button" className="modal-close-btn" onClick={handleCloseAndReset} aria-label="Fermer">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body" style={{ padding: "16px 0", color: "#4b5563" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
              {isBlocking ? (
                <>Voulez-vous bloquer le compte de <strong>{user.pseudo}</strong> ({user.email}) ?</>
              ) : (
                <>Voulez-vous lever le blocage actuel sur le compte de <strong>{user.pseudo}</strong> ?</>
              )}
            </p>

            {isBlocking && (
              <>
                <label className="form-label" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  Motif du blocage *
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Comportement inapproprié, fraude..."
                  required
                />
              </>
            )}
          </div>

          <div className="modal-actions" style={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: "12px", 
            marginTop: "16px" 
          }}>
            <button type="button" className="btn btn-outline" onClick={handleCloseAndReset}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ 
                background: isBlocking ? "#ef4444" : "#3b82f6", 
                borderColor: isBlocking ? "#ef4444" : "#3b82f6",
                color: "#fff"
              }}
            >
              {isBlocking ? "Confirmer le blocage" : "Confirmer le déblocage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}