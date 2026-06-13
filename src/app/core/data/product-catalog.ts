import { Product } from '../models/store.models';

export const PRODUCT_CATALOG: Product[] = [
  { id: 'catan', nombre: 'Catan', aliases: ['Catan'], precio: 33990, precioOriginal: 39990, imagen: '/img/catan.png', categoria: 'Estrategia', oferta: 'Oferta 15%', stock: 10, estado: 'activo' },
  { id: 'monopoly', nombre: 'Monopoly', aliases: ['Monopoly'], precio: 24990, imagen: '/img/monopoly.png', categoria: 'Top ventas', stock: 10, estado: 'activo' },
  { id: 'basta', nombre: 'Basta', aliases: ['Basta'], precio: 8600, imagen: '/img/basta.png', categoria: 'Familiares', stock: 10, estado: 'activo' },
  { id: 'ajedrez-premium', nombre: 'Ajedrez Premium', aliases: ['Ajedrez Premium'], precio: 18990, imagen: '/img/ajedrez.png', categoria: 'Estrategia', stock: 10, estado: 'activo' },
  { id: 'risk-clasico', nombre: 'Risk Clasico', aliases: ['Risk Clasico'], precio: 29990, imagen: '/img/risk.png', categoria: 'Estrategia', stock: 10, estado: 'activo' },
  { id: 'uno-party', nombre: 'Uno Party', aliases: ['Uno', 'Uno ', 'Uno Party'], precio: 9990, imagen: '/img/uno.png', categoria: 'Fiesta', stock: 10, estado: 'activo' },
  { id: 'dixit', nombre: 'Dixit', aliases: ['Dixit'], precio: 22390, precioOriginal: 27990, imagen: '/img/dixit.png', categoria: 'Fiesta', oferta: 'Oferta 20%', stock: 10, estado: 'activo' },
  { id: 'pictionary-air', nombre: 'Pictionary Air', aliases: ['Pictionary Air'], precio: 21990, imagen: '/img/pictionary.png', categoria: 'Fiesta', stock: 10, estado: 'activo' },
  { id: 'jenga-familiar', nombre: 'Jenga Familiar', aliases: ['Jenga Familiar'], precio: 13490, precioOriginal: 14990, imagen: '/img/jenga.png', categoria: 'Familiares', oferta: 'Oferta 10%', stock: 10, estado: 'activo' },
  { id: 'exploding-kittens', nombre: 'EXPLODING KITTENS', aliases: ['EXPLODING KITTENS'], precio: 19990, imagen: '/img/EXPLODING KITTENS.png', categoria: 'Familiares', stock: 10, estado: 'activo' },
  { id: 'catan-junior', nombre: 'Catan Junior', aliases: ['Catan Junior'], precio: 26390, precioOriginal: 29990, imagen: '/img/catan junior.png', categoria: 'Infantiles', oferta: 'Oferta 12%', stock: 10, estado: 'activo' },
  { id: 'dobble-31-minutos', nombre: 'Dobble 31 Minutos', aliases: ['31 Minutos', 'Dobble 31 Minutos'], precio: 15990, imagen: '/img/31 minutos.png', categoria: 'Infantiles', stock: 10, estado: 'activo' },
  { id: 'serpientes-y-escaleras', nombre: 'Serpientes y Escaleras', aliases: ['Serpientes y Escaleras'], precio: 6990, imagen: '/img/serpientes y escalera.png', categoria: 'Infantiles', stock: 10, estado: 'activo' },
];
