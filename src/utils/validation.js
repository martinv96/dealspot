const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function validateLoginForm(form) {
  const email = String(form.email || "").trim().toLowerCase();
  const password = String(form.password || "");

  if (!email) {
    return "Veuillez renseigner votre email.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Veuillez saisir une adresse email valide.";
  }

  if (!password) {
    return "Veuillez renseigner votre mot de passe.";
  }

  return "";
}

export function validateRegisterForm(form) {
  const pseudo = String(form.pseudo || "").trim();
  const email = String(form.email || "").trim().toLowerCase();
  const localisation = String(form.localisation || "").trim();
  const password = String(form.password || "");
  const confirmPassword = String(form.confirmPassword || "");

  if (pseudo.length < 2) {
    return "Le pseudo doit contenir au moins 2 caractères.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Veuillez saisir une adresse email valide.";
  }

  if (localisation && localisation.length < 2) {
    return "La localisation doit contenir au moins 2 caractères.";
  }

  if (!PASSWORD_REGEX.test(password)) {
    return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
  }

  if (password !== confirmPassword) {
    return "Les mots de passe ne correspondent pas.";
  }

  return "";
}

export function validateAnnonceForm(form) {
  const titre = String(form.titre || "").trim();
  const description = String(form.description || "").trim();
  const localisation = String(form.localisation || "").trim();
  const categorie = String(form.categorie || "").trim();
  const prix = Number.parseFloat(form.prix);

  if (titre.length < 5) {
    return "Le titre doit contenir au moins 5 caractères.";
  }

  if (description.length < 20) {
    return "La description doit contenir au moins 20 caractères.";
  }

  if (Number.isNaN(prix) || prix <= 0) {
    return "Le prix doit être supérieur à 0.";
  }

  if (!categorie) {
    return "Veuillez sélectionner une catégorie.";
  }

  if (localisation.length < 2) {
    return "La localisation doit contenir au moins 2 caractères.";
  }

  return "";
}