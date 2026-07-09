export default function ProfileInfoCard({
  isEditing,
  form,
  profileError,
  profileSuccess,
  profileLoading,
  onEditToggle,
  onChange,
  onSubmit,
  onOpenPasswordModal
}) {
  return (
    <form className="profile-card" onSubmit={onSubmit}>
      <div className="profile-card-head">
        <h3>Informations personnelles</h3>

        <button className="btn btn-outline" type="button" onClick={onEditToggle}>
          {isEditing ? "Annuler" : "Modifier"}
        </button>
      </div>

      <div className="profile-form">
        <div>
          <label>Nom complet</label>
          <input
            type="text"
            name="pseudo"
            value={form.pseudo}
            onChange={onChange}
            placeholder="Ex: Martin Vallée"
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Ex: martinv@email.fr"
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label>Téléphone</label>
          <input
            type="text"
            name="telephone"
            value={form.telephone}
            onChange={onChange}
            placeholder="Ex: 07 52 45 52 26"
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label>Localisation</label>
          <input
            type="text"
            name="localisation"
            value={form.localisation}
            onChange={onChange}
            placeholder="Ex: Paris 12ème"
            readOnly={!isEditing}
          />
        </div>
      </div>

      {profileError ? <p className="form-error">{profileError}</p> : null}
      {profileSuccess ? <p className="form-success">{profileSuccess}</p> : null}

      <div className="profile-actions">
        {isEditing ? (
          <button className="btn btn-primary" disabled={profileLoading} type="submit">
            {profileLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        ) : null}

        <button className="btn btn-profile-password" type="button" onClick={onOpenPasswordModal}>
          Changer le mot de passe
        </button>
      </div>
    </form>
  );
}
