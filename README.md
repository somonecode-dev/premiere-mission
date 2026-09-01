# Première Mission 🚀

> **La première expérience professionnelle ne devrait pas être la plus difficile à obtenir.**

Première Mission est une plateforme numérique conçue pour faciliter l'accès des jeunes à leur **première expérience professionnelle** en mettant en relation des candidats à la recherche d'opportunités et des organisations qui souhaitent proposer des missions accessibles aux profils débutants.

Le projet est né d'un constat simple : pour un jeune sans expérience professionnelle significative, il est souvent difficile de trouver une première opportunité permettant de développer ses compétences, construire son expérience et entrer progressivement dans le monde professionnel.

---

## 🚀 Application en ligne

👉 [Accéder à Première Mission](https://premiere-mission.vercel.app)

---

## 🎯 Le problème

La première expérience professionnelle constitue souvent un véritable obstacle pour les jeunes.

Les offres disponibles demandent fréquemment de l'expérience préalable, tandis que les candidats débutants disposent de peu d'occasions de démontrer concrètement leurs compétences.

Cette situation crée un cercle difficile à franchir :

**Pas d'expérience → peu d'opportunités → difficulté à obtenir une première expérience.**

Première Mission cherche à réduire cette barrière en proposant un espace simple permettant aux organisations de publier des missions adaptées aux profils débutants et aux candidats de découvrir ces opportunités et de suivre leurs candidatures.

---

## 💡 La solution

Première Mission propose une plateforme mettant en relation deux types d'utilisateurs :

### 👤 Candidats

Les candidats peuvent :

- créer leur compte ;
- consulter les missions disponibles ;
- consulter les détails d'une mission ;
- envoyer une candidature ;
- renseigner leur motivation ;
- consulter leurs candidatures ;
- suivre l'évolution du statut de leurs candidatures ;
- supprimer une candidature si nécessaire ;
- gérer leur profil.

### 🏢 Organisations

Les organisations peuvent :

- créer leur compte ;
- accéder à leur espace organisation ;
- proposer des missions ;
- consulter leurs missions ;
- consulter les candidatures reçues ;
- consulter le profil d'un candidat ;
- modifier le statut d'une candidature ;
- supprimer une mission.

---

## ✨ Fonctionnalités principales

### Authentification

- Inscription
- Connexion
- Déconnexion
- Gestion de session utilisateur
- Séparation des espaces candidat et organisation

### Missions

- Création de missions
- Consultation des missions
- Consultation détaillée d'une mission
- Informations sur le domaine, le niveau et la durée

### Candidatures

- Candidature à une mission
- Message de motivation
- Historique des candidatures
- Suivi du statut
- Consultation des détails
- Suppression d'une candidature

### Espace organisation

- Tableau de bord
- Gestion des missions
- Consultation des candidatures
- Consultation des informations candidat
- Gestion des statuts

### Profil

- Consultation des informations personnelles
- Gestion du profil utilisateur

---

## 🖥️ Parcours utilisateur

### Parcours candidat

```text
Inscription
    ↓
Connexion
    ↓
Espace candidat
    ↓
Découverte des missions
    ↓
Consultation d'une mission
    ↓
Candidature
    ↓
Suivi de la candidature
    ↓
Évolution du statut
````

### Parcours organisation

```text
Inscription
    ↓
Connexion
    ↓
Espace organisation
    ↓
Création d'une mission
    ↓
Réception des candidatures
    ↓
Consultation des candidats
    ↓
Mise à jour du statut
```

---

## 🏗️ Architecture

Première Mission repose sur une architecture web moderne séparant l'interface utilisateur, la logique applicative et les services backend.

```text
                    ┌──────────────────────┐
                    │       Utilisateur    │
                    │   Candidat / Org.    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Next.js         │
                    │     Frontend         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Supabase        │
                    │                      │
                    │  Authentification    │
                    │  Base de données     │
                    │  Row Level Security  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    PostgreSQL        │
                    │      Database        │
                    └──────────────────────┘
```

---

## 🛠️ Stack technique

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**

### Backend & données

* **Supabase**
* **PostgreSQL**
* **Supabase Auth**
* **Row Level Security (RLS)**

### Outils

* **Git**
* **GitHub**
* **npm**
* **Visual Studio Code**
* Outils d'IA générative utilisés comme assistants de développement

---

## 📁 Structure du projet

```text
premiere-mission/
│
├── .next/
│
├── app/
│   ├── candidatures/
│   ├── components/
│   ├── connexion/
│   ├── inscription/
│   ├── missions/
│   ├── organisation/
│   ├── profil/
│   ├── proposer-mission/
│   ├── AuthListener.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   └── supabase/
│
├── node_modules/
│
├── public/
│
├── .env.local
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── README.md
└── tsconfig.json
```

---

## 🔐 Sécurité

La gestion de l'authentification et des données repose sur Supabase.

Le projet utilise notamment :

* authentification utilisateur ;
* gestion des sessions ;
* séparation des rôles ;
* politiques de sécurité au niveau des lignes (**RLS**) ;
* variables d'environnement pour les paramètres Supabase ;
* absence de secrets sensibles dans le dépôt Git.

Les variables d'environnement locales sont volontairement exclues du dépôt grâce au `.gitignore`.

Exemple :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

> Les clés et informations sensibles ne doivent jamais être ajoutées directement au code source ou au dépôt public.

---

## ⚙️ Installation locale

### Prérequis

* Node.js
* npm
* Un projet Supabase

### 1. Cloner le dépôt

```bash
git clone https://github.com/somonecode-dev/premiere-mission.git
cd premiere-mission
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier :

```text
.env.local
```

Puis renseigner les variables nécessaires à Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera disponible localement sur :

```text
http://localhost:3000
```

---

## 🧪 Vérification du projet

Pour vérifier que le projet peut être construit correctement :

```bash
npm run build
```

Puis pour lancer la version de production :

```bash
npm start
```

---

## 🚀 Déploiement

Le projet est conçu pour être déployé sur une plateforme compatible avec Next.js.

Le déploiement prévu utilise :

* **Vercel** pour l'application web ;
* **Supabase** pour l'authentification et la base de données.

Les variables d'environnement doivent être configurées dans l'environnement de production.

---

## 📈 Scalabilité et évolutivité

L'architecture choisie permet de faire évoluer progressivement la plateforme.

Les prochaines évolutions pourraient notamment inclure :

* système de recherche et filtrage avancé ;
* notifications candidat/organisation ;
* système de messagerie ;
* recommandations de missions ;
* tableau de bord avec statistiques ;
* amélioration du profil candidat ;
* système de validation des organisations ;
* système de réputation ;
* API publique ;
* application mobile.

L'objectif est de conserver une architecture suffisamment simple pour le MVP tout en permettant l'ajout progressif de nouvelles fonctionnalités.

---

## 🌍 Impact recherché

Première Mission vise principalement les jeunes rencontrant des difficultés à accéder à leur première expérience professionnelle.

La plateforme cherche à :

* réduire la barrière de l'expérience préalable ;
* faciliter la rencontre entre jeunes et organisations ;
* favoriser l'acquisition d'une première expérience ;
* aider les jeunes à développer leurs compétences ;
* contribuer progressivement à leur insertion professionnelle.

---

## 🧭 Vision

Première Mission ne cherche pas simplement à proposer une nouvelle plateforme d'offres.

L'objectif est de créer un **premier pont entre les compétences d'un jeune et le monde professionnel**.

> **Donner une première opportunité pour permettre d'en construire d'autres.**

---

## 📌 État du projet

**Statut : MVP fonctionnel**

Le MVP comprend actuellement les principaux parcours candidat et organisation ainsi que la gestion des missions et candidatures.

Le projet continue d'évoluer avec des améliorations portant notamment sur l'expérience utilisateur, la sécurité, les performances et le déploiement.

---

## 👨‍💻 Auteur

**Souleymane Ba**

Étudiant en Informatique de Développement d'Applications |
Développeur Full-Stack en formation

* LinkedIn : [https://www.linkedin.com/in/souleymane-ba-dev](https://www.linkedin.com/in/souleymane-ba-dev)
* GitHub : [https://github.com/somonecode-dev](https://github.com/somonecode-dev)

---

## 📄 Licence

Ce projet est actuellement présenté comme un projet personnel et expérimental.

Toute réutilisation, modification ou redistribution doit respecter les droits de son auteur.

```
```
