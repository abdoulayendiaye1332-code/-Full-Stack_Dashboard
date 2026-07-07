# Plan d'implémentation - Eco-Stock Frontend React JSX (en Français)

Ce document décrit la structure et le plan de développement du frontend React JSX pour le système de gestion d'inventaire **Eco-Stock**. Le frontend consommera l'API Django REST et sera écrit entièrement en français (noms de fichiers, composants, variables, et commentaires) pour faciliter l'apprentissage et rester cohérent avec le backend.

## Éléments requis pour révision

> [!IMPORTANT]
> L'application React sera créée dans un sous-dossier nommé `frontend/` à la racine du projet.
>
> Nous utiliserons :
> - **React (JSX)** + **Vite** pour le build system.
> - **styled-components** pour le style (comme dans votre maquette).
> - **lucide-react** pour des icônes modernes et simples d'utilisation.
> - **react-router-dom** pour la navigation (Connexion, Tableau de bord, Produits, Entrepôts).

## Questions en suspens

- Aucune pour le moment. Toutes les variables, commentaires et noms de fichiers seront rédigés en français.

---

## Structure des Fichiers Proposée

L'application sera créée dans `C:/Users/Assane Ndong FALL/Desktop/Eco-Stock/frontend` avec la structure suivante :

```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── api/
    │   └── clientApi.js        # Service API centralisé (fetch) avec gestion du token JWT
    ├── contexte/
    │   └── ContexteAuth.jsx    # Contexte React pour l'état d'authentification
    ├── composants/             # Composants réutilisables (Responsabilité Unique - SRP)
    │   ├── Commun/
    │   │   ├── Bouton.jsx      # Boutons personnalisés stylisés
    │   │   ├── Entree.jsx      # Champs de saisie (inputs) stylisés
    │   │   ├── Tableau.jsx     # Tableaux de données réutilisables
    │   │   └── BoiteDialogue.jsx # Fenêtres modales de confirmation ou formulaires
    │   ├── Disposition/
    │   │   ├── BarreLaterale.jsx # Menu de navigation latéral
    │   │   └── EnTete.jsx        # Barre supérieure (utilisateur connecté & déconnexion)
    │   └── Produits/
    │       ├── LigneProduit.jsx  # Ligne individuelle du tableau de produits avec actions
    │       ├── FormulaireProduit.jsx # Formulaire d'ajout/modification de produit
    │       └── ModalDeplacement.jsx # Boîte de dialogue pour déplacer un produit d'entrepôt
    └── pages/                  # Pages principales
        ├── Connexion.jsx       # Page de connexion calquée sur votre maquette
        ├── TableauBord.jsx     # Statistiques globales (produits totaux, alertes)
        ├── Produits.jsx        # Gestion des produits (Recherche, filtres, CRUD)
        └── Entrepots.jsx       # Gestion des entrepôts (CRUD & Audit du nombre de produits)
```

### Détails Techniques

#### 1. Service d'API (`src/api/clientApi.js`)
Un client API en JavaScript qui :
- Permet la connexion en envoyant les identifiants à `/api/token/` et stocke les tokens dans le `localStorage`.
- Gère le rafraîchissement automatique des tokens expirés via `/api/token/refresh/`.
- Injecte l'en-tête `Authorization: Bearer <token>` pour les requêtes d'écriture (création, modification, déplacement, suppression) de produits/entrepôts.
- Fournit des fonctions simples : `getProduits()`, `creerProduit()`, `modifierProduit()`, `supprimerProduit()`, `deplacerProduit()`, `getEntrepots()`, `creerEntrepot()`, `getAuditEntrepot()`, etc.

#### 2. Contexte d'Authentification (`src/contexte/ContexteAuth.jsx`)
Expose à toute l'application :
- `utilisateur` : l'utilisateur connecté actuel (nom d'utilisateur, etc.).
- `estAuthentifie` : booléen indiquant s'il est connecté.
- `connexion(username, password)` : fonction de connexion.
- `deconnexion()` : fonction pour vider la session.

#### 3. Style (styled-components)
Les composants styled-components utiliseront le thème de couleur de votre maquette :
- Couleur dominante (Vert olive) : `#3A5B22`
- Couleur secondaire (Charbon) : `#3C4A42` ou `#191C1D`
- Bordures douces : `#BBCABF`
- Statuts de produits : 
  - `disponible` : fond vert `#D1FAE5` et texte `#065F46`
  - `reserve` : fond jaune `#FEF3C7` et texte `#92400E`
  - `perime` : fond rouge `#FEE2E2` et texte `#991B1B`

---

## Plan de Vérification

### Tests Automatisés
- Validation du build : execution de `npm run build` dans le répertoire `frontend/` pour s'assurer de l'absence d'erreurs de syntaxe ou de compilation.

### Vérification Manuelle
1. **Connexion** : Taper les identifiants et vérifier la redirection.
2. **Tableau de Bord** : Vérifier que les statistiques concordent avec la base de données.
3. **Opérations CRUD (Produits & Entrepôts)** :
   - Lecture publique des produits.
   - Ajout, modification, déplacement et suppression avec connexion obligatoire.
   - Vérification de la détection de péremption lors du déplacement de produit.
4. **Audit des Entrepôts** : Cliquer sur un entrepôt pour voir son audit (nombre total de produits stockés).
