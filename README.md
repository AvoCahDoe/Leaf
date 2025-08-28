# 🌍 Leaflet Marker Manager

**Leaflet Marker Manager** est une application web interactive moderne permettant la gestion avancée de marqueurs géolocalisés sur carte. Elle propose une différenciation par type (`COOPERATIVE`, `ENTREPRISE`, `ASSOCIATION`), un système de filtrage intelligent, le positionnement de l'utilisateur, le traçage d'itinéraires, et la persistance des données via un backend Flask connecté à MongoDB.

---

## 🗺️ Fonctionnalités principales

### 🗺️ Cartographie Interactive
- **Carte interactive** basée sur OpenStreetMap et Leaflet.js
- **Interface responsive** avec design moderne utilisant Tailwind CSS
- **Navigation fluide** avec zoom, déplacement, et affichage de la légende
- **Icônes personnalisées** pour chaque type de marqueur (bleu, jaune, rouge)

### 📍 Gestion des Marqueurs
- **Ajout, modification et suppression** de marqueurs via une interface intuitive
- **Formulaire structuré en sections** :
  - Informations générales : nom, activité, forme juridique
  - Localisation géographique : adresse complète ou coordonnées GPS
  - Informations de contact : téléphone, fax, email
  - Données légales : RC, ICE, chiffre d'affaires, nombre d'employés
- **Géocodage automatique** via Nominatim (OpenStreetMap)
- **Popup contextuel** affichant les détails du marqueur
- **Synchronisation en temps réel** avec la base de données MongoDB

### 💾 Interface de Gestion
- **Tableau de bord complet** avec liste des marqueurs
- **Édition en ligne** des propriétés de chaque marqueur
- **Suppression sécurisée** avec confirmation
- **Filtres intégrés** par type, ville, ou autre critère

### 🧭 Navigation et Itinéraires
- **Localisation utilisateur** avec icône personnalisée
- **Traçage d'itinéraire interactif** entre deux points :
  - Point de départ : position actuelle ou marqueur
  - Destination : autre marqueur ou position
- **Affichage des informations de route** :
  - Distance (en km)
  - Temps estimé (en minutes)
- **Route visuelle** tracée directement sur la carte

### 🔍 Système de Filtrage Avancé
- **Recherche multi-critères** :
  - Nom du marqueur
  - Forme juridique (COOPERATIVE, ENTREPRISE, ASSOCIATION)
  - Numéro ICE
- **Mise à jour instantanée** des résultats
- **Recherche insensible à la casse**
- **Résumé dynamique** du nombre de marqueurs filtrés

### 📊 Statistiques Avancées
- **Dashboard analytique** complet
- **Graphiques interactifs** :
  - Répartition par forme juridique (camembert)
  - Relation employés vs chiffre d'affaires (nuage de points)
  - Top villes par nombre de marqueurs (barres)
  - Moyenne d'employés par type juridique
  - Distribution des dates de création
  - Répartition par identifiant boursier
  - Comparaison tri-dimensionnelle (radar chart)
- **Indicateurs clés** :
  - Total des marqueurs
  - Moyenne d'employés
  - Chiffre d'affaires total
  - Villes uniques

### 🗃️ Import / Export des Données
- **Export JSON** des marqueurs visibles
- **Import JSON** pour ajouter plusieurs marqueurs simultanément
- **Validation automatique** du format des fichiers
- **Détecteur d'erreurs** pour garantir l'intégrité des données

---

## 🛠️ Technologies utilisées

| Composant           | Technologie                    | Version    |
|--------------------|--------------------------------|------------|
| **Frontend**        | Angular (Standalone Components) | 19+        |
| **Cartographie**    | Leaflet.js + Routing Machine   | Latest     |
| **Styling**         | Tailwind CSS                   | 3.x        |
| **Backend**         | Python Flask                   | 2.x        |
| **Base de données** | MongoDB (local ou Atlas)       | 6.x+       |
| **API REST**        | GET, POST, DELETE              | -          |
| **Géocodage**       | Nominatim (OpenStreetMap)      | -          |
| **Visualisation**   | Chart.js / D3.js               | -          |

---

## 📸 Captures d'écran

### 🗺️ Vue principale de la carte
![Main View](/assets/MainView.png)  
> Interface principale avec carte interactive, boutons de contrôle, itinéraire tracé et popup de détail.

### 📌 Ajout de marqueur
![Add Marker](/assets/AddMarker.png)  
> Vue de la carte avec localisation de l'utilisateur et ajout d'un nouveau marqueur.

### 🛣️ Traçage d'itinéraire
![Itinéraire](/assets/Route.png)  
> Système de routage avec sélection de points et affichage des informations de trajet (distance/temps).

### 📌 Localisation utilisateur
![Position utilisateur](/assets/UserPosition.png)  
> Géolocalisation automatique avec icône utilisateur personnalisée et popup d'information.

### 🔍 Filtre de recherche
![Filter](/assets/Filter.png)  
> Modal de filtrage permettant de rechercher par nom, forme juridique ou numéro ICE.

### 📊 Tableau de gestion des marqueurs
![Statistiques Avancées](/assets/CRUD.png)
> Interface de gestion avec liste des marqueurs et formulaire d'édition.

### 📈 Dashboard statistique
  
![Gestion des Marqueurs](/assets/Stat.png)  
![Gestion des Marqueurs](/assets/stat2.png)  
> Analyse détaillée des marqueurs avec graphiques interactifs et indicateurs clés.

---

## 🧑‍💻 Installation & Lancement

### Prérequis
- Node.js 18+ et Angular CLI 19+
- Python 3.8+ et pip
- MongoDB (local ou Atlas)

### 1. Backend (Flask + MongoDB)

```bash
# Cloner le repository
git clone https://github.com/AvoCahDoe/Leaf.git  
cd Leaf/backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer MongoDB (local ou Atlas)
# Modifier la chaîne de connexion dans app.py si nécessaire

# Lancer le serveur Flask
python app.py
# Backend disponible sur http://localhost:5000
```

### 2.  Frontend (Angular 19)

```bash
# Aller dans le dossier frontend
cd ../leaf

# Installer les dépendances Node.js
npm install

# Lancer le serveur de développement
ng serve -o
# Application disponible sur http://localhost:4200
```


### 3.  Strucutre de Projet


```
Leaf-App/
│
├── back-leaf/
│   ├── app.py                    # Serveur Flask principal
│   ├── requirements.txt          # Dépendances Python
│   └── models/                   # Modèles de données
│
├── leaf/                         # Application Angular
│   ├── src/app/
│   │   ├── map/
│   │   │   ├── map.ts           # Logique principale du composant
│   │   │   ├── map.html         # Template avec modales
│   │   │   └── map.scss         # Styles et animations
│   │   ├── gestion/
│   │   │   ├── gestion.component.ts
│   │   │   └── gestion.component.html
│   │   ├── stats/
│   │   │   ├── stats.component.ts
│   │   │   └── stats.component.html
│   │   ├── app.ts               # Composant racine
│   │   ├── app.routes.ts        # Configuration des routes
│   │   └── app.config.ts        # Configuration Angular
│   │
│   └── assets/                   # Ressources statiques
│       ├── blue.png             # Icône COOPERATIVE
│       ├── yellow.png           # Icône ENTREPRISE  
│       ├── red.png              # Icône ASSOCIATION
│       ├── UserIcon.png         # Icône utilisateur
│       └── leaf-shadow.png      # Ombre des marqueurs
│
└── README.md
```

![Statistiques Avancées](/assets/Structure.svg)

## 💾 Modèle de données MongoDB

```json
{
  "_id": {
    "$oid": "676f8a2c4d2b1e3f5a7c9d8e"
  },
  "name": "Coopérative Agricole Atlas",
  "lat": 31.6295,
  "lng": -7.9811,
  "activity": "Agriculture biologique",
  "address": "Avenue Hassan II",
  "city": "Marrakech",
  "phone": "+212 6 12 34 56 78",
  "fax": "+212 5 24 12 34 56",
  "email": "contact@coop-atlas.ma",
  "rc": "RC45789",
  "ice": "001234567000078",
  "form": "COOPERATIVE",
  "addr_housenumber": "125",
  "addr_street": "Avenue Hassan II",
  "addr_postcode": "40000",
  "addr_province": "Marrakech-Safi",
  "addr_place": "Gueliz",
  "employees": 23,
  "turnover": 25000,
  "creation_date": "2020-05-15",
  "stock_id": "BOURSE123",
  "active_clients": 150
}
```

## 🔧 Configuration API

```bash
GET    /markers          # Récupérer tous les marqueurs
POST   /markers          # Créer un nouveau marqueur  
PUT    /markers/:id      # Mettre à jour un marqueur
DELETE /markers/:id      # Supprimer un marqueur par ID
```

## Format de requête POST

```json
{
  "name": "Nom requis",
  "lat": 31.6295,
  "lng": -7.9811,
  "form": "COOPERATIVE|ENTREPRISE|ASSOCIATION",
  "activity": "Activité optionnelle",
  "address": "Adresse complète",
  "city": "Ville",
  "phone": "+212...",
  "email": "contact@example.com",
  "rc": "RC12345",
  "ice": "001234567000078",
  "employees": 50,
  "turnover": 100000,
  "creation_date": "2023-01-01",
  "stock_id": "BOURSE123",
  "active_clients": 100
}
```


## 🎯 Guide d'utilisation

### 📍 Ajouter un marqueur
1. Cliquer sur **"Gestion markers"**
2. Remplir le formulaire (nom obligatoire, forme juridique requise)
3. Saisir l'adresse ou les coordonnées GPS directement
4. Le géocodage automatique convertit les adresses en coordonnées
5. Cliquer sur **"Ajouter le Marqueur"**

### 🔍 Filtrer les marqueurs
1. Cliquer sur **"Filtrer"** pour ouvrir la modal
2. Utiliser les filtres seuls ou combinés :
   - **Nom** : recherche textuelle (insensible à la casse)
   - **Forme juridique** : sélection dans liste déroulante
   - **ICE** : recherche par numéro d'identification
3. Les résultats s'affichent en temps réel
4. Utiliser **"Réinitialiser"** pour effacer tous les filtres

### 🛣️ Créer un itinéraire
1. Cliquer sur **"Itinéraire"**
2. Sélectionner le point de départ (position utilisateur ou marqueur)
3. Choisir la destination (position utilisateur ou marqueur)
4. Cliquer sur **"Tracer"** pour afficher la route
5. Consulter la distance et le temps estimé

### 📌 Navigation
- **"Ma position"** : centrer la carte sur votre localisation
- **Icône localisation** : centrer sur un marqueur spécifique
- **Icône poubelle** : supprimer un marqueur

### 🗃️ Importer / Exporter les marqueurs

**Exporter**
1. Cliquer sur **"Exporter"**
2. Un fichier `.json` contenant tous les marqueurs visibles sera généré
3. Le fichier peut être téléchargé localement

**Importer**
1. Cliquer sur **"Importer"**
2. Glisser un fichier `.json` ou en sélectionner un manuellement
3. Vérification du format des marqueurs
4. Les nouveaux marqueurs sont ajoutés à la carte et sauvegardés en base

---

## ✨ Nouveautés et améliorations

### Fonctionnalités récentes
- **Dashboard statistique complet** avec visualisations avancées
- **Gestion centralisée des marqueurs** avec édition en ligne
- **Export/Import JSON** pour une meilleure portabilité des données

### Améliorations par rapport à la version précédente
- Refactorisation complète de l'interface utilisateur
- Ajout du système de filtrage intelligent
- Intégration complète du géocodage automatique
- Optimisation des performances de rendu
- Amélioration de l'expérience utilisateur mobile

---

## 🐛 Dépannage

### Problèmes courants

**La carte ne se charge pas :**
- Vérifier la connexion internet (tuiles OpenStreetMap)
- Contrôler la console pour les erreurs JavaScript

**Les marqueurs n'apparaissent pas :**
- Vérifier que le backend Flask fonctionne sur le port 5000
- Contrôler la connexion MongoDB
- Vérifier le format des données en base

**Le géocodage ne fonctionne pas :**
- Contrôler la connexion internet
- Vérifier le format de l'adresse saisie
- Le service Nominatim peut avoir des limites de débit

**Les filtres ne répondent pas :**
- Actualiser la page
- Vérifier que les données contiennent les champs filtrés
- Contrôler la console pour les erreurs

---

## 🚀 Améliorations futures

### 🎯 Prochaines fonctionnalités
- **Authentification utilisateur** et gestion des sessions
- **Export/Import** des données (JSON, CSV, GeoJSON)
- **Déploiement cloud** (Heroku, Render, Vercel)
- **Tableaux de bord** personnalisables
- **Couches cartographiques** multiples (satellite, terrain)

### 🛠️ Améliorations techniques
- Tests unitaires et d'intégration
- Cache intelligent des données ( On it rn!)
