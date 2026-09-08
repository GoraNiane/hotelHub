# 🏨 TERANGA PALACE HOTEL - Plateforme Hôtelière de Réservation & Gestion

Une véritable plateforme web complète et professionnelle de réservation en ligne et de gestion hôtelière (SaaS) conçue pour le **Teranga Palace Hotel**, un hôtel 4 étoiles fictif situé à Dakar, Sénégal.

Ce projet propose une interface moderne s'appuyant sur l'identité visuelle du luxe et de l'hospitalité sénégalaise (Téranga), connectée à un backend REST robuste et une base de données MariaDB persistante.

---

## 🏗️ Architecture du Projet

Le projet est divisé en deux applications distinctes dans la structure suivante :

```text
hotel-management/
├── frontend/             # Client React + TypeScript (Vite, Tailwind CSS, Axios)
└── backend/              # REST API Node.js + Express + TypeScript + Prisma ORM + MariaDB
```

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React + TypeScript + Vite
- **Routage** : React Router Dom
- **Styling** : Tailwind CSS (Thème personnalisé avec teintes or, vert profond et blanc cassé)
- **Formulaires & Validation** : React Hook Form & Zod
- **Client HTTP** : Axios avec intercepteurs automatiques pour JWT
- **Graphiques** : Recharts
- **Icônes** : Lucide React

### Backend
- **Serveur** : Node.js + Express.js + TypeScript
- **Accès Base de Données** : Prisma ORM
- **Base de Données** : MariaDB (MySQL-compatible)
- **Sécurité & Auth** : JSON Web Token (JWT) & Bcryptjs (hachage des mots de passe)
- **Validation** : Zod schemas
- **Sécurité réseau** : CORS, Helmet
- **Documentation** : Swagger / OpenAPI

---

## 🔐 Rôles Utilisateurs & Fonctionnalités

### 1. Visiteur / Site Public
- **Accueil** : Hero avec visuels premiums, recherche de disponibilités dynamique.
- **Chambres** : Liste des chambres disponibles filtrée par type, prix, capacité, et commodités.
- **Détails de Chambre** : Galerie de photos, description complète, et calculateur de tarif par nuitée.
- **Tunnel de Réservation** : Processus d'achat en 6 étapes (Sélection de chambre, Dates & Voyageurs, Informations, Résumé des coûts, Simulation de Paiement, Confirmation).

### 2. Espace Client (`CLIENT`)
- **Dashboard** : Prochain séjour, historique des réservations, dépenses totales, notifications.
- **Réservations** : Liste et statuts détaillés (`PENDING`, `CONFIRMED`, `CANCELLED`, `CHECKED_IN`, `CHECKED_OUT`).
- **Avis** : Dépôt de notes et commentaires après séjour.
- **Profil** : Modification des informations personnelles.

### 3. Espace Réceptionniste (`RECEPTIONIST`)
- **Dashboard de Réception** : Arrivées/Départs du jour, taux d'occupation, état des chambres en direct.
- **Calendrier** : Vue globale des réservations par date et numéro de chambre.
- **Check-in / Check-out** : Enregistrement de l'arrivée client (Chambre passe à `OCCUPIED`) et du départ (Chambre passe à `CLEANING` puis `AVAILABLE`).
- **Création de Réservation** : Possibilité de réserver pour un client en direct.

### 4. Espace Administrateur (`ADMIN`)
- **Dashboard Financier** : Revenus cumulés, réservations mensuelles, graphiques Recharts (chiffre d'affaires, taux d'occupation, chambres favorites).
- **CRUD Utilisateurs** : Gestion complète des employés (réceptionnistes, administrateurs) et des comptes clients.
- **CRUD Chambres & Services** : Ajout/Modification de chambres, photos et services annexes de l'hôtel.
- **CRUD Codes Promos** : Ajout et suivi de campagnes promotionnelles (ex. `TERANGA10`, `INAUGUR20`).
- **Modération des Avis** : Approbation ou suppression des retours clients.

---

## 🚀 Installation et Configuration

### Prérequis
- Node.js (v18 ou supérieur)
- MariaDB / MySQL s'exécutant sur le port local `3308` (ou modifiable dans le `.env`)

### 1. Configuration et Lancement du Backend

1. Ouvrez un terminal dans le dossier `/backend`.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` basé sur le modèle suivant :
   ```env
   PORT=5000
   DATABASE_URL="mysql://root:2004@localhost:3308/teranga_hotel"
   JWT_SECRET="votre_cle_secrete_super_longue"
   JWT_EXPIRES_IN="24h"
   ```
4. Poussez le schéma Prisma vers MariaDB pour créer les tables et générer le client :
   ```bash
   npx prisma db push
   ```
5. Remplissez la base de données avec le jeu de données de démonstration :
   ```bash
   npx prisma db seed
   ```
6. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

Le serveur backend écoutera sur le port **5000**.
La documentation API interactive Swagger est disponible sur : **`http://localhost:5000/api-docs`**.

---

### 2. Configuration et Lancement du Frontend

1. Ouvrez un terminal dans le dossier `/frontend`.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```

Le serveur de développement de Vite s'exécutera (généralement sur le port `5173`). Vite est configuré pour faire proxy des requêtes `/api` directement vers le port `5000` du backend.

---

## 🔑 Comptes de Démonstration (Prêts à l'emploi)

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@terangapalace.com` | `admin` |
| **Réceptionniste** | `reception@terangapalace.com` | `reception` |
| **Client** | `client@gmail.com` | `client` |

*Note: Les données de démonstration incluent des réservations actives (avec check-in fait), des séjours passés (prêts pour des avis clients) et des réservations futures.*
