import { useState } from 'react';
import api from '../services/api';
import '../styles/components/contact.css';
import PrivateHeader from "../components/PrivateHeader";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/useAuth";


export default function ContactPage() {
  const [form, setForm] = useState({ email: '', sujet: '', message: '', categorie: '' });
  const [status, setStatus] = useState(null);
  const { isAuthenticated } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus(null);
    try {
      await api.post('/contact', form);
      setStatus('Message envoyé !');
      setForm({ email: '', sujet: '', message: '', categorie: '' });
    } catch {
      setStatus('Erreur lors de l’envoi.');
    }
  };

  return (
    <div className="page-shell">
      {isAuthenticated ? <PrivateHeader /> : <PublicHeader />}
      <main className="page-main contact-main">
        <div className="contact-card">
          <h2>Contactez-nous</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input name="email" id="email" type="email" placeholder="Votre email" value={form.email} onChange={handleChange} required />
            <label htmlFor="sujet">Sujet</label>
            <input name="sujet" id="sujet" placeholder="Sujet" value={form.sujet} onChange={handleChange} required />
            <label htmlFor="categorie">Catégorie</label>
            <input name="categorie" id="categorie" placeholder="Catégorie" value={form.categorie} onChange={handleChange} />
            <label htmlFor="message">Message</label>
            <textarea name="message" id="message" placeholder="Votre message" value={form.message} onChange={handleChange} required />
            <button type="submit" className="btn btn-primary">Envoyer</button>
          </form>
          {status && <div className={status.includes('Erreur') ? 'contact-error' : 'contact-status'}>{status}</div>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}