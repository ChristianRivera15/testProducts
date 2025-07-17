import { Routes } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list.component';

export const routes: Routes = [
  { 
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    component: ProductListComponent,
    // children: [
    //   { path: 'add', component: ProductListComponent }
    // ]
  },
  { 
    path: '**',
    redirectTo: 'products'
  }
];