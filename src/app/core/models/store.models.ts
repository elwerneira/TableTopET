export interface Product {
  id: string;
  nombre: string;
  aliases: string[];
  precio: number;
  precioOriginal?: number;
  imagen: string;
  categoria: string;
  oferta?: string;
  stock: number;
  estado: 'activo' | 'inactivo';
}

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  precioOriginal?: number;
  imagen: string;
  categoria: string;
  oferta?: string;
  cantidad: number;
}

export interface Purchase {
  id: string;
  fecha: string;
  estado: string;
  total: number;
  items: CartItem[];
}

export interface SessionUser {
  nombre: string;
  usuario: string;
  correo: string;
  rol: 'admin' | 'cliente';
}

export interface User extends SessionUser {
  password: string;
  fechaNacimiento?: string;
  direccion?: string;
  estado: 'activo' | 'bloqueado';
}

export interface StoreActionResult {
  ok: boolean;
  message: string;
  requiresLogin?: boolean;
}
