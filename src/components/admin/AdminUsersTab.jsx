export default function AdminUsersTab({
  filters,
  setFilters,
  state,
  onSubmitFilters,
  onToggleUserBlock,
  onDeleteUser,
  onPreviousPage,
  onNextPage,
  formatDate,
  formatNumber
}) {
  return (
    <section className="admin-panel">
      <form className="admin-filters" onSubmit={onSubmitFilters}>
        <input
          type="text"
          value={filters.query}
          onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          placeholder="Pseudo ou email"
        />
        <select
          value={filters.role}
          onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
        >
          <option value="">Tous rôles</option>
          <option value="acheteur">acheteur</option>
          <option value="vendeur">vendeur</option>
          <option value="admin">admin</option>
        </select>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={filters.blockedOnly}
            onChange={(event) =>
              setFilters((current) => ({ ...current, blockedOnly: event.target.checked }))
            }
          />
          Uniquement bloqués
        </label>
        <button type="submit" className="btn btn-primary">Appliquer</button>
      </form>

      <p className="admin-summary">{formatNumber(state.total)} utilisateurs trouvés.</p>

      {state.loading ? <p className="center-loader">Chargement des utilisateurs...</p> : null}
      {state.error ? <p className="form-error">{state.error}</p> : null}

      {!state.loading && !state.error ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pseudo</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Bloqué</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.pseudo}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.is_blocked ? "Oui" : "Non"}</td>
                  <td>{formatDate(user.date_inscription)}</td>
                  <td>
                    <div className="admin-actions-row compact">
                      <button type="button" className="btn btn-outline" onClick={() => onToggleUserBlock(user)}>
                        {user.is_blocked ? "Débloquer" : "Bloquer"}
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => onDeleteUser(user.id)}>
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
