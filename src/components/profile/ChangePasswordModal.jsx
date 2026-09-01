export default function ChangePasswordModal({
  isOpen,
  onClose,
  passwordForm,
  passwordError,
  passwordSuccess,
  passwordLoading,
  onChange,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Changer le mot de passe</h3>
        <p>Saisissez votre mot de passe actuel puis le nouveau.</p>

        <form className="password-modal-form" onSubmit={onSubmit}>
          <div>
            <label>Mot de passe actuel</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={onChange}
              required
            />
          </div>

          {passwordError ? <p className="form-error">{passwordError}</p> : null}
          {passwordSuccess ? <p className="form-success">{passwordSuccess}</p> : null}

          <div className="modal-actions">
            <button className="btn btn-outline" type="button" onClick={onClose}>
              Annuler
            </button>

            <button className="btn btn-primary" disabled={passwordLoading} type="submit">
              {passwordLoading ? "Modification..." : "Valider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
