/**
 * clientApi.js
 * Centralise toutes les communications avec le backend Django.
 * Gère l'authentification JWT (stockage et rafraîchissement automatique du token).
 * Effectue la traduction et le mapping des structures de données (Français <-> Anglais)
 * pour correspondre aux modèles de données du backend.
 */

const BASE_URL = ''; // Utilise le proxy configuré dans Vite (ex: /api)

// Mappings pour le statut des produits
const mappingStatutVersFrontend = {
  'AVAILABLE': 'disponible',
  'RESERVED': 'reserve',
  'EXPIRED': 'perime'
};

const mappingStatutVersBackend = {
  'disponible': 'AVAILABLE',
  'reserve': 'RESERVED',
  'perime': 'EXPIRED'
};

// Mapping Produit : Backend (Anglais) -> Frontend (Français)
function mapProduitVersFrontend(bp) {
  if (!bp) return null;
  return {
    id: bp.id,
    nomp: bp.name,
    quantite: bp.quantity,
    date_expiration: bp.expiration_date,
    status: mappingStatutVersFrontend[bp.status] || bp.status,
    entrepot: bp.warehouse
  };
}

// Mapping Produit : Frontend (Français) -> Backend (Anglais)
function mapProduitVersBackend(fp) {
  if (!fp) return null;
  return {
    name: fp.nomp,
    quantity: fp.quantite,
    expiration_date: fp.date_expiration,
    status: mappingStatutVersBackend[fp.status] || fp.status,
    warehouse: fp.entrepot
  };
}

// Mapping Entrepôt : Backend (Anglais) -> Frontend (Français)
function mapEntrepotVersFrontend(be) {
  if (!be) return null;
  return {
    id: be.id,
    nom: be.name,
    localisation: be.location,
    capacite: be.capacity,
    produits: be.products ? be.products.map(mapProduitVersFrontend) : []
  };
}

// Mapping Entrepôt : Frontend (Français) -> Backend (Anglais)
function mapEntrepotVersBackend(fe) {
  if (!fe) return null;
  return {
    name: fe.nom,
    location: fe.localisation,
    capacity: fe.capacite
  };
}

/**
 * Fonction utilitaire pour récupérer les headers par défaut.
 * Ajoute automatiquement le token JWT s'il est présent.
 */
function obtenirHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('eco_stock_access');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fonction générique pour effectuer des requêtes HTTP.
 * Gère automatiquement le rafraîchissement du token en cas d'erreur 401 (non autorisé).
 */
async function requete(url, options = {}) {
  // Fusionne les options et les headers par défaut
  options.headers = {
    ...obtenirHeaders(),
    ...options.headers,
  };

  let reponse = await fetch(url, options);

  // Si le token a expiré (erreur 401), on tente de le rafraîchir
  if (reponse.status === 401) {
    const tokenRafraichissement = localStorage.getItem('eco_stock_refresh');
    if (tokenRafraichissement) {
      try {
        const estRafraichi = await rafraichirToken(tokenRafraichissement);
        if (estRafraichi) {
          // On réessaie la requête originale avec le nouveau token
          options.headers = {
            ...obtenirHeaders(),
            ...options.headers,
          };
          reponse = await fetch(url, options);
        }
      } catch (erreur) {
        console.error('Échec du rafraîchissement automatique du token :', erreur);
      }
    }
  }

  return reponse;
}

/**
 * Rafraîchit le jeton d'accès (Access Token) à l'aide du Refresh Token.
 */
async function rafraichirToken(refresh) {
  try {
    const reponse = await fetch('/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (reponse.ok) {
      const donnees = await reponse.json();
      localStorage.setItem('eco_stock_access', donnees.access);
      return true;
    }
  } catch (erreur) {
    console.error('Erreur réseau lors du rafraîchissement :', erreur);
  }
  
  // Si le rafraîchissement échoue, on déconnecte l'utilisateur
  deconnexion();
  return false;
}

/**
 * Se déconnecter en vidant le localStorage.
 */
export function deconnexion() {
  localStorage.removeItem('eco_stock_access');
  localStorage.removeItem('eco_stock_refresh');
  localStorage.removeItem('eco_stock_utilisateur');
}

/**
 * Service d'API exportant toutes les fonctions de communication.
 */
export const clientApi = {
  // --- AUTHENTIFICATION ---
  
  /**
   * Connecte l'utilisateur avec son nom d'utilisateur et son mot de passe.
   */
  connexion: async (username, password) => {
    const reponse = await fetch('/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!reponse.ok) {
      const erreur = await reponse.json();
      throw new Error(erreur.detail || 'Identifiants incorrects');
    }

    const donnees = await reponse.json();
    localStorage.setItem('eco_stock_access', donnees.access);
    localStorage.setItem('eco_stock_refresh', donnees.refresh);
    localStorage.setItem('eco_stock_utilisateur', username);
    return username;
  },

  // --- ENTREPÔTS ---

  /**
   * Récupère la liste de tous les entrepôts.
   */
  getEntrepots: async () => {
    const reponse = await requete('/api/warehouses/');
    if (!reponse.ok) throw new Error('Impossible de charger les entrepôts');
    const data = await reponse.json();
    return data.map(mapEntrepotVersFrontend);
  },

  /**
   * Crée un nouvel entrepôt.
   */
  creerEntrepot: async (entrepotData) => {
    const backendData = mapEntrepotVersBackend(entrepotData);
    const reponse = await requete('/api/warehouses/', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    if (!reponse.ok) {
      const erreur = await reponse.json();
      throw new Error(Object.values(erreur).flat().join(' ') || 'Erreur lors de la création');
    }
    const data = await reponse.json();
    return mapEntrepotVersFrontend(data);
  },

  /**
   * Modifie un entrepôt existant.
   */
  modifierEntrepot: async (id, entrepotData) => {
    const backendData = mapEntrepotVersBackend(entrepotData);
    const reponse = await requete(`/api/warehouses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    if (!reponse.ok) {
      const erreur = await reponse.json();
      throw new Error(Object.values(erreur).flat().join(' ') || 'Erreur lors de la modification');
    }
    const data = await reponse.json();
    return mapEntrepotVersFrontend(data);
  },

  /**
   * Supprime un entrepôt.
   */
  supprimerEntrepot: async (id) => {
    const reponse = await requete(`/api/warehouses/${id}/`, {
      method: 'DELETE',
    });
    if (!reponse.ok) throw new Error('Erreur lors de la suppression de l\'entrepôt');
    return true;
  },

  /**
   * Effectue un audit d'un entrepôt spécifique (total des produits stockés).
   */
  getAuditEntrepot: async (id) => {
    const reponse = await requete(`/api/warehouses/${id}/audit/`);
    if (!reponse.ok) throw new Error('Impossible de récupérer l\'audit de l\'entrepôt');
    const backendData = await reponse.json();
    return {
      Entrepot: backendData.warehouse,
      total_products: backendData.total_products,
      by_status: backendData.by_status
    };
  },

  // --- PRODUITS ---

  /**
   * Récupère la liste de tous les produits.
   */
  getProduits: async () => {
    const reponse = await requete('/api/products/');
    if (!reponse.ok) throw new Error('Impossible de charger les produits');
    const data = await reponse.json();
    return data.map(mapProduitVersFrontend);
  },

  /**
   * Crée un nouveau produit.
   */
  creerProduit: async (produitData) => {
    const backendData = mapProduitVersBackend(produitData);
    const reponse = await requete('/api/products/', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    if (!reponse.ok) {
      const erreur = await reponse.json();
      throw new Error(Object.values(erreur).flat().join(' ') || 'Erreur lors de la création du produit');
    }
    const data = await reponse.json();
    return mapProduitVersFrontend(data);
  },

  /**
   * Modifie un produit existant.
   */
  modifierProduit: async (id, produitData) => {
    const backendData = mapProduitVersBackend(produitData);
    const reponse = await requete(`/api/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    if (!reponse.ok) {
      const erreur = await reponse.json();
      throw new Error(Object.values(erreur).flat().join(' ') || 'Erreur lors de la modification du produit');
    }
    const data = await reponse.json();
    return mapProduitVersFrontend(data);
  },

  /**
   * Supprime un produit.
   */
  supprimerProduit: async (id) => {
    const reponse = await requete(`/api/products/${id}/`, {
      method: 'DELETE',
    });
    if (!reponse.ok) throw new Error('Erreur lors de la suppression du produit');
    return true;
  },

  /**
   * Déplace un produit vers un autre entrepôt.
   */
  deplacerProduit: async (produitId, entrepotId) => {
    const reponse = await requete(`/api/products/${produitId}/move/`, {
      method: 'POST',
      body: JSON.stringify({ warehouse: entrepotId }),
    });

    if (!reponse.ok) {
      const erreur = await reponse.json();
      throw new Error(erreur.error || 'Erreur lors du déplacement du produit');
    }

    // Récupérer le nom de l'entrepôt pour un affichage convivial
    let nomEntrepot = `l'entrepôt #${entrepotId}`;
    try {
      const whReponse = await requete(`/api/warehouses/${entrepotId}/`);
      if (whReponse.ok) {
        const whData = await whReponse.json();
        if (whData && whData.name) {
          nomEntrepot = whData.name;
        }
      }
    } catch (e) {
      console.warn("Impossible de récupérer le nom de l'entrepôt cible pour le message de déplacement :", e);
    }

    return {
      message: 'Produit transféré.',
      Entrepot: nomEntrepot
    };
  },
};
