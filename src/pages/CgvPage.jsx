import PrivateHeader from "../components/PrivateHeader";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/useAuth";

export default function CgvPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-shell">
      {isAuthenticated ? <PrivateHeader /> : <PublicHeader />}
      <main className="page-main cgv-main">
        <div className="cgv-container">
          <div className="cgv-card">
            <header className="cgv-header">
              <h1>Conditions Générales de Vente et d'Utilisation</h1>
              <p>En vigueur au 10 mai 2026</p>
            </header>

            <div className="cgv-content">
              <section className="cgv-section">
                <h2>
                Article 1 : Objet du service
                </h2>
                <p>
                  DealSpot est une plateforme technique de mise en relation de
                  particulier à particulier (C2C). DealSpot permet à des
                  utilisateurs de publier des annonces et d'entrer en contact via
                  une messagerie interne.
                  <strong>
                    {" "}
                    Nous n'intervenons pas dans les transactions et ne sommes pas
                    partie prenante aux ventes.
                  </strong>
                </p>
              </section>

              <section className="cgv-section">
                <h2>
                  Article 2 : Accès et Création de compte
                </h2>
                <p>
                  L'accès à la création d'annonces et à la messagerie nécessite la
                  création d'un compte utilisateur sécurisé. Vous êtes responsable
                  de la confidentialité de votre mot de passe et des activités de
                  votre compte.
                </p>
              </section>

              <section className="cgv-section">
                <h2>
                Article 3 : Publication des Annonces
                </h2>
                <p>
                  Toute annonce doit être conforme à la réalité du produit (limite
                  de 5 images par annonce). La vente de produits contrefaits,
                  illégaux ou dangereux est strictement interdite et entraînera la
                  suppression immédiate du contenu.
                </p>
              </section>

              <section className="cgv-section">
                <h2>
                Article 4 : Responsabilité
                </h2>
                <p>
                  En tant qu'hébergeur, DealSpot ne peut être tenu responsable des
                  vices cachés, de la non-conformité des objets vendus ou des
                  éventuels litiges financiers entre acheteurs et vendeurs.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
