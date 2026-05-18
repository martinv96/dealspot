const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const ALLOWED_ANNONCE_STATUSES = new Set(["active", "brouillon", "expirée"]);
const ALLOWED_ANNONCE_CATEGORIES = new Set([
  "meubles",
  "electronique",
  "mode",
  "sport",
  "jeux-loisirs",
  "autres"
]);

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value, maxLength) {
  const trimmed = trimString(value);
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, maxLength);
}

function requiredString(value, fieldName, minLength, maxLength) {
  const trimmed = trimString(value);
  if (!trimmed) {
    return { error: fieldName + " est requis." };
  }
  if (trimmed.length < minLength) {
    return { error: fieldName + " doit contenir au moins " + minLength + " caractères." };
  }
  if (trimmed.length > maxLength) {
    return { error: fieldName + " ne peut pas dépasser " + maxLength + " caractères." };
  }
  return { value: trimmed };
}

function validateEmail(value) {
  const trimmed = trimString(value).toLowerCase();
  if (!trimmed) {
    return { error: "Email est requis." };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { error: "Adresse email invalide." };
  }
  return { value: trimmed };
}

function validatePassword(value, fieldLabel = "Le mot de passe") {
  const raw = typeof value === "string" ? value : "";
  if (!raw) {
    return { error: fieldLabel + " est requis." };
  }
  if (!PASSWORD_REGEX.test(raw)) {
    return {
      error: fieldLabel + " doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)."
    };
  }
  return { value: raw };
}

function validatePrix(value) {
  const numberValue = Number.parseFloat(value);
  if (Number.isNaN(numberValue)) {
    return { error: "Le prix doit être un nombre valide." };
  }
  if (numberValue <= 0) {
    return { error: "Le prix doit être supérieur à 0." };
  }
  if (numberValue > 9999999) {
    return { error: "Le prix est trop élevé." };
  }
  return { value: numberValue };
}

export function validateRegisterBody(body) {
  const pseudo = requiredString(body.pseudo, "Le pseudo", 2, 50);
  if (pseudo.error) return pseudo;

  const email = validateEmail(body.email);
  if (email.error) return email;

  const password = validatePassword(body.password);
  if (password.error) return password;

  return {
    value: {
      pseudo: pseudo.value,
      email: email.value,
      password: password.value,
      localisation: normalizeOptionalString(body.localisation, 255)
    }
  };
}

export function validateLoginBody(body) {
  const email = validateEmail(body.email);
  if (email.error) return email;

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return { error: "Le mot de passe est requis." };
  }

  return {
    value: {
      email: email.value,
      password
    }
  };
}

export function validateUpdateProfileBody(body) {
  const pseudo = requiredString(body.pseudo, "Le pseudo", 2, 50);
  if (pseudo.error) return pseudo;

  const email = validateEmail(body.email);
  if (email.error) return email;

  return {
    value: {
      pseudo: pseudo.value,
      email: email.value,
      telephone: normalizeOptionalString(body.telephone, 30),
      localisation: normalizeOptionalString(body.localisation, 255)
    }
  };
}

export function validateChangePasswordBody(body) {
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Tous les champs mot de passe sont requis." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "La confirmation du mot de passe ne correspond pas." };
  }

  const password = validatePassword(newPassword, "Le nouveau mot de passe");
  if (password.error) return password;

  return {
    value: {
      currentPassword,
      newPassword,
      confirmPassword
    }
  };
}

export function validateAnnonceBody(body, { partial = false } = {}) {
  const value = {};

  if (!partial || body.titre !== undefined) {
    const titre = requiredString(body.titre, "Le titre", 5, 150);
    if (titre.error) return titre;
    value.titre = titre.value;
  }

  if (!partial || body.description !== undefined) {
    const description = requiredString(body.description, "La description", 20, 3000);
    if (description.error) return description;
    value.description = description.value;
  }

  if (!partial || body.prix !== undefined) {
    const prix = validatePrix(body.prix);
    if (prix.error) return prix;
    value.prix = prix.value;
  }

  if (!partial || body.categorie !== undefined) {
    const categorie = trimString(body.categorie);
    if (!categorie) {
      return { error: "La catégorie est requise." };
    }
    if (!ALLOWED_ANNONCE_CATEGORIES.has(categorie)) {
      return { error: "La catégorie sélectionnée est invalide." };
    }
    value.categorie = categorie;
  }

  if (!partial || body.localisation !== undefined) {
    const localisation = requiredString(body.localisation, "La localisation", 2, 255);
    if (localisation.error) return localisation;
    value.localisation = localisation.value;
  }

  if (body.statut !== undefined) {
    const statut = trimString(body.statut);
    if (!ALLOWED_ANNONCE_STATUSES.has(statut)) {
      return { error: "Le statut de l'annonce est invalide." };
    }
    value.statut = statut;
  }

  if (!partial && !value.statut) {
    value.statut = "active";
  }

  if (body.existingImages !== undefined) {
    value.existingImages = body.existingImages;
  }

  return { value };
}

export function validateBody(validateFn) {
  return (req, res, next) => {
    const result = validateFn(req.body || {});
    if (result?.error) {
      return res.status(400).json({ message: result.error });
    }

    req.validatedBody = result?.value || {};
    return next();
  };
}

export function validateForgotPasswordBody(body) {
  const email = validateEmail(body.email);
  if (email.error) return email;

  return {
    value: {
      email: email.value
    }
  };
}

export function validateResetPasswordBody(body) {
  const token = trimString(body.token);
  if (!token) {
    return { error: "Le token de réinitialisation est requis." };
  }

  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!newPassword || !confirmPassword) {
    return { error: "Le nouveau mot de passe et sa confirmation sont requis." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "La confirmation du mot de passe ne correspond pas." };
  }

  const password = validatePassword(newPassword, "Le nouveau mot de passe");
  if (password.error) return password;

  return {
    value: {
      token,
      newPassword,
      confirmPassword
    }
  };
}