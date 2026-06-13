import { Routes } from '@angular/router';

import {Admin} from './pages/admin/admin';
import {Carrito} from './pages/carrito/carrito';
import {Estrategia} from './pages/estrategia/estrategia';
import {Familiares} from './pages/familiares/familiares';
import {Fiesta} from './pages/fiesta/fiesta';
import {Formulario} from './pages/formulario/formulario';
import {Infantiles} from './pages/infantiles/infantiles';
import {Inicio} from './pages/inicio/inicio';
import {Login} from './pages/login/login';
import {MisCompras} from './pages/mis-compras/mis-compras';
import {Perfil} from './pages/perfil/perfil';
import {Recuperar} from './pages/recuperar/recuperar';

export const routes: Routes = [
        { path: '', component: Inicio},
        { path: 'admin', component: Admin},
        { path: 'carrito', component: Carrito},
        { path: 'estrategia', component: Estrategia},
        { path: 'familiares', component: Familiares},
        { path: 'fiesta', component: Fiesta},
        { path: 'formulario', component: Formulario},
        { path: 'infantiles', component: Infantiles},
        { path: 'login', component: Login},
        { path: 'mis-compras', component: MisCompras},
        { path: 'perfil', component: Perfil},
        { path: 'recuperar', component: Recuperar},
];
