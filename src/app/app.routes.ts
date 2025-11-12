import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./views/pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'station/:id',
    loadComponent: () => import('./views/pages/station/station.page').then( m => m.StationPage)
  },
  {
    path: 'map',
    loadComponent: () => import('./views/components/overview/overview.component').then( m => m.OverviewComponent)
  }
];
