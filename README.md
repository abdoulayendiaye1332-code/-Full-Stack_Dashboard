#  Eco-Stock - Guide d'Installation et Explication du Frontend React

Bienvenue dans le guide du frontend **Eco-Stock**. Ce projet est une application web construite avec **React (JSX)** et **Vite** qui sert d'interface de gestion pour le backend Django REST d'Eco-Stock.

Ce guide est spécialement rédigé pour les **débutants** ou toute personne n'ayant jamais fait de React. Il vous permettra de comprendre l'architecture du code et de démarrer l'application très facilement.

---

##  Guide de Démarrage Rapide

Si vous n'avez jamais utilisé React, suivez simplement ces étapes une par une :

### Étape 1 : Installer Node.js (Le Prérequis)
Pour faire tourner cette application, vous devez installer **Node.js** sur votre ordinateur :
1. Allez sur le site officiel : [https://nodejs.org/](https://nodejs.org/)
2. Téléchargez et installez la version **LTS** (recommandée pour la majorité des utilisateurs).
3. Une fois installé, ouvrez votre terminal et tapez `node -v` puis `npm -v` pour vérifier que l'installation s'est bien déroulée (des numéros de version doivent s'afficher).

### Étape 2 : Lancer le Backend Django
Le frontend communique avec le serveur Django (qui contient la base de données).
1. Ouvrez un terminal à la racine du projet `Eco-Stock`.
2. Lancez le serveur Django en tapant :
   ```bash
   python manage.py runserver
   ```
   *(Le backend doit tourner sur l'adresse par défaut : `http://127.0.0.1:8000`)*

### Étape 3 : Installer les dépendances du Frontend
1. Ouvrez un **nouveau** terminal et déplacez-vous dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez toutes les bibliothèques nécessaires à l'aide de la commande suivante :
   ```bash
   npm install
   ```
   *(Cette commande lit le fichier `package.json` et télécharge automatiquement tous les modules nécessaires comme styled-components ou lucide-react dans un dossier appelé `node_modules`)*

### Étape 4 : Lancer le Frontend
1. Toujours dans le dossier `frontend` de votre terminal, démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
2. Ouvrez votre navigateur et allez à l'adresse indiquée, généralement : **[http://localhost:5173/](http://localhost:5173/)**
3. Connectez-vous avec vos identifiants d'administrateur Django (créés via `python manage.py createsuperuser`).

---

##  Architecture et Refactoring du Code

Le code a été restructuré en respectant le **Principe de Responsabilité Unique (SRP)** : chaque fichier a un rôle précis, simple et unique. Voici comment s'organise le dossier `src/` :

```
frontend/src/
├── main.jsx             # Point d'entrée principal (démarre l'application React).
├── App.jsx              # Configuteur des pages de l'application et des accès sécurisés.
├── index.css            # Styles CSS globaux (police d'écriture, marges de base).
│
├── api/
│   └── clientApi.js     # Gère TOUTES les requêtes HTTP (Fetch) envoyées au backend Django.
│
├── contexte/
│   └── ContexteAuth.jsx # Gère l'état de l'utilisateur connecté (Token JWT, connexion, déconnexion).
│
├── composants/          # Composants visuels réutilisables
│   ├── Commun/          # Éléments d'interface de base
│   │   ├── Bouton.jsx   # Boutons personnalisables (Vert, Rouge, Gris, etc.).
│   │   ├── Entree.jsx   # Inputs, formulaires et listes déroulantes de sélection.
│   │   ├── Tableau.jsx  # Tableaux de données et badges colorés pour les statuts.
│   │   └── BoiteDialogue.jsx # Fenêtres modales pop-up.
│   ├── Disposition/     # Structure de la mise en page générale
│   │   ├── BarreLaterale.jsx # Menu de gauche.
│   │   └── EnTete.jsx        # Barre du haut (affiche l'utilisateur connecté).
│   └── Produits/        # Composants métiers liés aux produits
│       ├── LigneProduit.jsx
│       ├── FormulaireProduit.jsx
│       └── ModalDeplacement.jsx
│
└── pages/               # Écrans complets de l'application
    ├── Connexion.jsx    # Page d'identification (calquée sur votre maquette).
    ├── TableauBord.jsx  # Page d'accueil avec indicateurs statistiques.
    ├── Produits.jsx     # Écran d'inventaire (recherche, filtres, CRUD).
    └── Entrepots.jsx    # Écran de gestion des locaux de stockage.
```

---

## Explication simplifiée des concepts clés de l'application

Si vous débutez en React, voici les 3 concepts clés utilisés dans ce projet :

### 1. Le Proxy d'API (dans `vite.config.js`)
Pour éviter que React ne fasse des requêtes complexes en écrivant sans cesse `http://localhost:8000/api/produits/`, nous avons configuré un **proxy**.
Désormais, lorsque le frontend appelle `/api/produits`, Vite redirige la requête de façon transparente vers `http://localhost:8000/api/produits`. Cela résout les problèmes de CORS (blocage de sécurité des navigateurs).

### 2. Le Client API centralisé (`src/api/clientApi.js`)
Au lieu d'écrire des requêtes `fetch()` un peu partout dans vos pages (ce qui alourdit le code), tout est centralisé dans ce fichier.
* **Le plus important** : Il gère automatiquement les jetons **JWT**. Lorsque vous vous connectez, le backend donne un jeton d'accès (valable quelques minutes) et un jeton de rafraîchissement. Notre client API intercepte les requêtes expirées (Erreur 401) et demande automatiquement un nouveau jeton au backend en arrière-plan sans interrompre l'utilisateur.

### 3. Le Contexte d'Authentification (`src/contexte/ContexteAuth.jsx`)
Dans React, transmettre des informations d'un composant parent à un composant enfant éloigné peut être fastidieux (c'est le *Prop Drilling*).
Pour éviter cela, nous utilisons un **Contexte**. Il permet de stocker l'état global "Qui est connecté ?" et de rendre les fonctions `connexion()` et `deconnexion()` accessibles depuis n'importe quel fichier de l'application via le simple hook `useAuth()`.

---

## Outils utilisés
* **Vite** : Outil de build ultra-rapide pour React.
* **styled-components** : Permet d'écrire du code CSS directement à l'intérieur de nos fichiers JavaScript pour styliser nos composants.
* **lucide-react** : Une collection d'icônes vectorielles modernes et légères (utilisée pour les boutons de recherche, cadenas, etc.).
* **react-router-dom** : Permet de créer plusieurs pages au sein de notre application React (Single Page Application).
