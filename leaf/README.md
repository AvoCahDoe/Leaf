# 🗺️ CartMapComponent — Référence Complète

## 1. 🗺️ Carte & Leaflet

### 🧠 Propriétés

| Nom                  | Rôle                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `map`                | Instance principale de la carte Leaflet                             |
| `leafletMarkers`     | Dictionnaire `{ id: string → L.Marker }` des marqueurs sur la carte |
| `markersVisible`     | Booléen pour afficher/cacher les marqueurs                          |
| `routingControl`     | Contrôle Leaflet Routing pour itinéraires                           |
| `userLocation`       | Position géographique de l'utilisateur                              |
| `userLocationMarker` | Marqueur de l’utilisateur sur la carte                              |
| `manualGeoMarker`    | Marqueur temporaire utilisé en mode géo manuelle                    |
| `clickedCoordinates` | Coordonnées cliquées en mode géo manuelle                           |
| `clickedAddress`     | Adresse récupérée en reverse géocodage                              |

### 🔧 Méthodes

| Nom                              | Rôle                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `initMap()`                      | Initialise la carte Leaflet avec OpenStreetMap                                         |
| `addMarkerToMap(marker, center)` | Ajoute un marqueur Leaflet à la carte                                                  |
| `generatePopupContent(marker)`   | Génère le contenu HTML du popup d’un marqueur                                          |
| `centerMapOnMarker(marker)`      | Centre la carte sur un marqueur donné                                                  |
| `toggleMarkersVisibility()`      | Affiche ou cache tous les marqueurs                                                    |
| `centerOnUserLocation()`         | Utilise `navigator.geolocation` pour centrer la carte sur la position de l'utilisateur |
| `drawRoute()`                    | Calcule et affiche un itinéraire entre deux points                                     |

---

## 2. 📍 Marqueurs (Ajout, Suppression, Chargement)

### 🧠 Propriétés

| Nom                                                | Rôle                                       |
| -------------------------------------------------- | ------------------------------------------ |
| `markers`                                          | Tableau de tous les marqueurs dans la base |
| `filteredMarkers`                                  | Marqueurs correspondant aux filtres actifs |
| `newLatitude`, `newLongitude`                      | Coordonnées pour nouveau marqueur          |
| `newMarkerName`, `newActivity`, `newAddress`, etc. | Champs du formulaire de nouveau marqueur   |
| `selectedA`, `selectedB`                           | IDs sélectionnés pour calcul d’itinéraire  |

### 🔧 Méthodes

| Nom                        | Rôle                                               |
| -------------------------- | -------------------------------------------------- |
| `loadMarkersFromDB()`      | Récupère les marqueurs depuis la base via API      |
| `addMarker()`              | Ajoute un nouveau marqueur (géocode si nécessaire) |
| `removeMarker(index)`      | Supprime un marqueur de la carte et de la base     |
| `trackById(index, marker)` | Optimisation Angular `*ngFor` (suivi par ID)       |

---

## 3. 🌐 Géocodage & Géolocalisation

### 🔧 Méthodes

| Nom                             | Rôle                                                   |
| ------------------------------- | ------------------------------------------------------ |
| `geocodeAddress(address, city)` | Géocode une adresse en coordonnées (utilise Nominatim) |
| `reverseGeocode(lat, lng)`      | Trouve l’adresse d’un point par coordonnées            |

---

## 4. 🧭 Mode Géolocalisation Manuelle

### 🧠 Propriétés

| Nom                  | Rôle                                                    |
| -------------------- | ------------------------------------------------------- |
| `isManualGeoMode`    | Active/désactive le mode géolocalisation manuelle       |
| `showManualGeoModal` | Affiche la modale de confirmation pour coord. manuelles |

### 🔧 Méthodes

| Nom                            | Rôle                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| `toggleManualGeoMode()`        | Active/désactive le mode de géolocalisation manuelle        |
| `onMapClick(e)`                | Récupère les coordonnées après clic sur la carte            |
| `copyCoordinates()`            | Copie les coordonnées cliquées dans le presse-papiers       |
| `useCoordinatesForNewMarker()` | Utilise les coord. manuelles pour créer un nouveau marqueur |
| `closeManualGeoModal()`        | Ferme la modale de géolocalisation manuelle                 |

---

## 5. 🔎 Filtres des Marqueurs

### 🧠 Propriétés

| Nom                                     | Rôle                         |
| --------------------------------------- | ---------------------------- |
| `filterName`, `filterForm`, `filterIce` | Champs de filtre utilisateur |

### 🔧 Méthodes

| Nom                         | Rôle                                           |
| --------------------------- | ---------------------------------------------- |
| `applyFilters()`            | Applique les filtres sur les marqueurs         |
| `updateMarkersVisibility()` | Met à jour l’affichage en fonction des filtres |
| `clearFilters()`            | Réinitialise les filtres                       |
| `getFilteredMarkersCount()` | Retourne le nombre de marqueurs filtrés        |

---

## 6. 📤 Exportation des Marqueurs

### 🔧 Méthodes

| Nom               | Rôle                                                        |
| ----------------- | ----------------------------------------------------------- |
| `exportMarkers()` | Exporte les marqueurs sous forme de fichier JSON TypeScript |

---

## 7. 📥 Importation des Marqueurs

### 🧠 Propriétés

| Nom               | Rôle                                                     |
| ----------------- | -------------------------------------------------------- |
| `showImportModal` | Affiche/cache la modale d'importation                    |
| `importFile`      | Fichier JSON sélectionné par l’utilisateur               |
| `importPreview`   | Aperçu des marqueurs à importer                          |
| `importStats`     | Compteur des marqueurs valides/invalides dans le fichier |

### 🔧 Méthodes

| Nom                            | Rôle                                            |
| ------------------------------ | ----------------------------------------------- |
| `toggleImportModal()`          | Affiche ou ferme la modale d'importation        |
| `onFileSelected(event)`        | Détecte le fichier JSON importé                 |
| `previewImportFile(file)`      | Prévisualise et valide le contenu du fichier    |
| `validateImportMarker(marker)` | Vérifie qu’un marqueur est valide pour import   |
| `importMarkers()`              | Géocode et insère les marqueurs en base via API |

---

## 8. 🧩 Divers / Techniques

### Propriétés

| Nom                 | Rôle                                             |
| ------------------- | ------------------------------------------------ |
| `isLoading`         | Booléen pour l’état de chargement                |
| `showGestionModal`  | Affiche le formulaire de gestion                 |
| `showRoutingInputs` | Affiche les entrées pour itinéraires             |
| `currentRouteInfo`  | Infos sur l’itinéraire calculé (distance, durée) |
| `apiUrl`            | URL de l’API backend                             |
