const CATEGORIES = [
  { value: "meubles", label: "Meubles", icon: "🪑" },
  { value: "electronique", label: "Électronique", icon: "📱" },
  { value: "mode", label: "Mode", icon: "👕" },
  { value: "sport", label: "Sport", icon: "⚽" },
  { value: "jeux-loisirs", label: "Jeux & Loisirs", icon: "🎮" },
  { value: "autres", label: "Autres", icon: "📦" }
];

export default function CategoryExplorerSection({ selectedCategory, onCategoryChange }) {
  return (
    <section className="section categories-section">
      <h2>Explorer par catégorie</h2>

      <div className="categories-grid">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            className={"category-btn" + (selectedCategory === category.value ? " active" : "")}
            onClick={() => onCategoryChange(category.value)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      {selectedCategory ? (
        <button type="button" className="btn btn-outline category-reset-btn" onClick={() => onCategoryChange(null)}>
          Réinitialiser les filtres
        </button>
      ) : null}
    </section>
  );
}
