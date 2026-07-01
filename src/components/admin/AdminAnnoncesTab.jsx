export default function AdminAnnoncesTab({
  filters,
  setFilters,
  state,
  editingAnnonceId,
  editingAnnonceForm,
  setEditingAnnonceForm,
  onSubmitFilters,
  onOpenEdit,
  onSaveEdit,
  onCloseEdit,
  onDeleteAnnonce,
  onPreviousPage,
  onNextPage,
  formatDate,
  formatNumber,
  categoryOptions,
  statusOptions
}) {
  return (
    <section className="admin-panel">
      <form className="admin-filters" onSubmit={onSubmitFilters}>
        <input
          type="text"
          value={filters.query}
          onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          placeholder="Titre ou description"
        />
        <select
          value={filters.statut}
          onChange={(event) => setFilters((current) => ({ ...current, statut: event.target.value }))}
        >
          <option value="">Tous statuts</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={filters.categorie}
          onChange={(event) => setFilters((current) => ({ ...current, categorie: event.target.value }))}
        >
          <option value="">Toutes catégories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">Appliquer</button>
      </form>

      {editingAnnonceForm ? (
        <div className="admin-edit-box">
          <h3>Modifier l'annonce #{editingAnnonceId}</h3>
          <div className="admin-edit-grid">
            <input
              type="text"
              value={editingAnnonceForm.titre}
              onChange={(event) =>
                setEditingAnnonceForm((current) => ({ ...current, titre: event.target.value }))
              }
              placeholder="Titre"
            />
            <input
              type="number"
              min="1"
              step="0.01"
              value={editingAnnonceForm.prix}
              onChange={(event) =>
                setEditingAnnonceForm((current) => ({ ...current, prix: event.target.value }))
              }
              placeholder="Prix"
            />
            <input
              type="text"
              value={editingAnnonceForm.localisation}
              onChange={(event) =>
                setEditingAnnonceForm((current) => ({ ...current, localisation: event.target.value }))
              }
              placeholder="Localisation"
            />
            <select
              value={editingAnnonceForm.categorie}
              onChange={(event) =>
                setEditingAnnonceForm((current) => ({ ...current, categorie: event.target.value }))
              }
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={editingAnnonceForm.statut}
              onChange={(event) =>
                setEditingAnnonceForm((current) => ({ ...current, statut: event.target.value }))
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={editingAnnonceForm.description}
            onChange={(event) =>
              setEditingAnnonceForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Description"
          />
          <div className="admin-actions-row">
            <button type="button" className="btn btn-primary" onClick={onSaveEdit}>
              Enregistrer
            </button>
            <button type="button" className="btn btn-outline" onClick={onCloseEdit}>
              Annuler
            </button>
          </div>
        </div>
      ) : null}

      <p className="admin-summary">{formatNumber(state.total)} annonces trouvées.</p>

      {state.loading ? <p className="center-loader">Chargement des annonces...</p> : null}
      {state.error ? <p className="form-error">{state.error}</p> : null}

      {!state.loading && !state.error ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Vendeur</th>
                <th>Création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.annonces.map((annonce) => (
                <tr key={annonce.id}>
                  <td>{annonce.id}</td>
                  <td>{annonce.titre}</td>
                  <td>{annonce.categorie}</td>
                  <td>{annonce.statut}</td>
                  <td>{annonce.vendeur?.pseudo || "-"}</td>
                  <td>{formatDate(annonce.date_publication)}</td>
                  <td>
                    <div className="admin-actions-row compact">
                      <button type="button" className="btn btn-outline" onClick={() => onOpenEdit(annonce)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => onDeleteAnnonce(annonce.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="admin-pager">
        <button
          type="button"
          className="btn btn-outline"
          disabled={state.page <= 1 || state.loading}
          onClick={onPreviousPage}
        >
          Précédent
        </button>
        <span>
          Page {state.page} / {state.pages}
        </span>
        <button
          type="button"
          className="btn btn-outline"
          disabled={state.page >= state.pages || state.loading}
          onClick={onNextPage}
        >
          Suivant
        </button>
      </div>
    </section>
  );
}
