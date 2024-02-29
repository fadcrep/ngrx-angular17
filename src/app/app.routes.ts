import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        redirectTo: "todos",
        pathMatch: "full",
      },
      {
        path: "todos",
        loadComponent: () => import('./routes/todos/todos.route'),
      }
];
