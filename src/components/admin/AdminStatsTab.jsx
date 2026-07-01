export default function AdminStatsTab({
  loading,
  error,
  data,
  statsCards,
  onRefresh,
  formatNumber
}) {
  return (
    <section className="admin-panel">
      <div className="admin-actions-row">
        <button type="button" className="btn btn-outline" onClick={onRefresh}>
          Actualiser
        </button>
      </div>

      {loading ? <p className="center-loader">Chargement des statistiques...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error && data ? (
        <>
          <div className="admin-stats-grid">
            {statsCards.map((card) => (
              <article className="admin-stat-card" key={card.label}>
                <h3>{card.value}</h3>
                <p>{card.label}</p>
              </article>
            ))}
          </div>

          <div className="admin-stats-details">
            <div className="admin-block">
              <h3>Répartition des annonces par statut</h3>
              <ul>
                {Object.entries(data.annonces?.byStatus || {}).map(([key, value]) => (
                  <li key={key}>
                    <span>{key}</span>
                    <strong>{formatNumber(value)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="admin-block">
              <h3>Top catégories</h3>
              <ul>
                {Object.entries(data.annonces?.byCategory || {}).map(([key, value]) => (
                  <li key={key}>
                    <span>{key}</span>
                    <strong>{formatNumber(value)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="admin-block">
              <h3>Rôles utilisateurs</h3>
              <ul>
                {Object.entries(data.users?.byRole || {}).map(([key, value]) => (
                  <li key={key}>
                    <span>{key}</span>
                    <strong>{formatNumber(value)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
