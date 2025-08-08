    import { Routes } from '@angular/router';
    // import { MapComponent } from './features/map/map'; // Assurez-vous que le chemin est correct
    // import { GestionComponent } from './features/gestion/gestion.component';
    // import { StatistiquesComponent } from './features/statistiques/statistiques.component';

    import { MapComponent } from './features/map/map/map';
    import { StatistiquesComponent } from './features/statistiques/statistiques/statistiques';
    import { GestionComponent } from './features/gestion/gestion/gestion';

    export const routes: Routes = [
      { path: '', redirectTo: '/map', pathMatch: 'full' },
      { path: 'map', component: MapComponent },
      { path: 'gestion', component: GestionComponent },
      { path: 'statistiques', component: StatistiquesComponent },
      { path: '**', redirectTo: '/map' }
    ];
