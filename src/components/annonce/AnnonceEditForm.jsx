export default function AnnonceEditForm({
  editForm,
  isSaving,
  locationSuggestions,
  onCancel,
  onEditChange,
  onFilesChange,
  onSave,
}) {
  return (
    <div className="annonce-edit-form">
      <label>Titre</label>
      <input
        name="titre"
        value={editForm.titre}
        onChange={onEditChange}
      />

      <label>Prix (€)</label>
      <input
        name="prix"
        type="number"
        value={editForm.prix}
        onChange={onEditChange}
      />

      <label>Localisation</label>
      <input
        name="localisation"
        value={editForm.localisation}
        onChange={onEditChange}
        list="annonce-localisation-suggestions"
        autoComplete="off"
        placeholder="Ville, code postal..."
      />
      <datalist id="annonce-localisation-suggestions">
        {locationSuggestions.map((suggestion) => (
          <option key={suggestion.label} value={suggestion.label} />
        ))}
      </datalist>

      <label>Ajouter des photos</label>
      <input
        type="file"
        multiple
        onChange={(event) => onFilesChange(event.target.files)}
      />

      <div className="annonce-owner-actions" style={{ marginTop: "1rem" }}>
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          className="btn btn-outline"
          onClick={onCancel}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
