import React from 'react';
import { Link } from 'react-router-dom';
import PrivateHeader from "../components/PrivateHeader";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/useAuth";

export default function About() {

const { isAuthenticated } = useAuth();
  return (
      <div className="about-page">
        {isAuthenticated ? <PrivateHeader /> : <PublicHeader />}
      {/* section head */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">À propos de DealSpot</h1>
          <p className="about-hero-subtitle">
            Votre plateforme locale et intuitive dédiée à l'économie circulaire de proximité.
          </p>
        </div>
      </section>

      {/* section histoire application */}
      <section className="about-section-white">
        <div className="about-flex-wrapper">
          <div className="about-text-block">
            <h2 className="about-section-title text-left">Qui sommes-nous ?</h2>
            <p>
              Face à l'urgence climatique et avec la volonté grandissante de consommer de manière plus responsable, donner une seconde vie à nos objets est devenu un geste essentiel. Acheter et vendre d'occasion permet de prolonger la durée de vie des produits tout en réalisant de réelles économies.
            </p>
            <p>
              Cependant, nous avons constaté que de nombreuses solutions actuelles s'avèrent complexes, impersonnelles ou mal adaptées aux échanges rapides du quotidien. C'est pourquoi nous avons créé <strong>DealSpot</strong>.
            </p>
            <p>
              Notre concept tient en quelques mots : vous proposer une expérience simple, fluide et entièrement sécurisée, centrée sur la <strong>proximité géographique</strong>.
            </p>
          </div>
          
          <div className="about-badge-card">
            <h3 className="about-card-brand">DealSpot</h3>
            <p className="about-subtext mb-20">Consommer mieux, près de chez soi.</p>
            <div className="about-pill">
              Éco-responsable & Local
            </div>
          </div>
        </div>
      </section>

      {/* section avantages plateforme */}
      <section className="about-section-gray">
        <h2 className="about-section-title">Pourquoi choisir DealSpot ?</h2>
        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-badge">01</div>
            <h3 className="about-card-title">Une simplicité absolue</h3>
            <p>
              Pas de fioritures. Une interface pensée pour vous permettre de publier une annonce ou de trouver la perle rare en seulement quelques clics.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-badge">02</div>
            <h3 className="about-card-title">Le choix de la proximité</h3>
            <p>
              Favorisez les circuits courts ! DealSpot met en avant les annonces disponibles autour de vous pour simplifier les remises en main propre.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-badge">03</div>
            <h3 className="about-card-title">Échanges sécurisés</h3>
            <p>
              Discutez instantanément et en toute sérénité avec les acheteurs et vendeurs grâce à notre système de messagerie interne intégrée.
            </p>
          </div>
        </div>
      </section>

      {/* section final (rejoindre / profil ) */}
      <section className="about-section-white text-center padding-cta">
        <h2 className="about-section-title">Rejoignez l'aventure</h2>
        <p className="about-subtext text-center max-w-500">
          Chaque objet vendu sur DealSpot est un déchet en moins et une bonne affaire en plus. Communauté grandissante, transactions locales, plateforme épurée... qu'attendez-vous ?
        </p>
        <div className="about-cta-buttons">
          <Link to="/" className="about-btn-main">
            Découvrir les annonces
          </Link>
          {!isAuthenticated && (
            <Link to="/inscription" className="about-btn-secondary">
              Créer un compte
            </Link>
          )} {isAuthenticated && (
            <Link to="/profil" className="about-btn-secondary">
                Mon profil
            </Link>
          )}
        </div>
      </section>
<SiteFooter />
    </div>
  );
}