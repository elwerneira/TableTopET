import { inject, Injectable, signal } from '@angular/core';

import { SessionUser, StoreActionResult, User } from '../models/store.models';
import { BrowserStorageService } from './browser-storage.service';

/** Clave utilizada para conservar la sesión en el navegador. */
const STORAGE_SESSION_KEY = 'tabletop_session';

/** Clave utilizada para conservar las cuentas registradas. */
const STORAGE_USERS_KEY = 'tabletop_users';

/** Prefijo de los carritos guardados por usuario. */
const STORAGE_CART_PREFIX = 'tabletop_cart_';

/** Prefijo de los historiales de compra guardados por usuario. */
const STORAGE_PURCHASES_PREFIX = 'tabletop_purchases_';

/** Cuenta administrativa que debe existir al inicializar la aplicación. */
const ADMIN_DEFAULT: User = {
  nombre: 'Administrador',
  usuario: 'admin',
  correo: 'admin@tabletopet.cl',
  password: 'Admin123',
  rol: 'admin',
  estado: 'activo',
};

/**
 * Servicio responsable de la autenticación y administración básica de usuarios.
 *
 * Mantiene la sesión activa, registra nuevos clientes, valida inicios de sesión,
 * permite recuperar contraseñas y asegura la existencia de una cuenta
 * administradora por defecto.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Acceso seguro al almacenamiento del navegador. */
  private readonly storage = inject(BrowserStorageService);

  /** Estado interno que conserva los datos de la sesión actual. */
  private readonly sessionState = signal<SessionUser | null>(
    this.storage.readSession<SessionUser | null>(STORAGE_SESSION_KEY, null),
  );

  /** Sesión activa expuesta como señal de solo lectura. */
  readonly session = this.sessionState.asReadonly();

  /** Inicializa el servicio y garantiza que exista la cuenta administradora. */
  constructor() {
    this.ensureAdmin();
  }

  /**
   * Registra un usuario cliente y deja su sesión iniciada si el usuario o correo no existen.
   *
   * @param user Datos del usuario sin rol ni estado, ya que esos valores se asignan automáticamente.
   * @returns Resultado de la operación con mensaje para mostrar en pantalla.
   */
  register(user: Omit<User, 'rol' | 'estado'>): StoreActionResult {
    const users = this.users();
    if (this.findUser(user.usuario, users) || this.findUser(user.correo, users)) {
      return { ok: false, message: 'Ese usuario o correo ya existe.' };
    }

    const registered: User = { ...user, rol: 'cliente', estado: 'activo' };
    this.saveUsers([...users, registered]);
    this.setSession(this.toSession(registered));
    return { ok: true, message: 'Cuenta registrada e inicio de sesion realizado correctamente.' };
  }

  /**
   * Inicia sesión usando usuario o correo junto con la contraseña.
   *
   * @param identifier Usuario o correo electrónico ingresado.
   * @param password Contraseña ingresada.
   * @returns Resultado de la operación con mensaje para el usuario.
   */
  login(identifier: string, password: string): StoreActionResult {
    const user = this.findUser(identifier);
    if (!user || user.password !== password) {
      return { ok: false, message: 'Usuario o contrasena incorrectos.' };
    }
    if (user.estado === 'bloqueado') {
      return { ok: false, message: 'Tu cuenta esta bloqueada. Debes contactar al administrador.' };
    }

    this.setSession(this.toSession(user));
    return { ok: true, message: 'Sesion iniciada correctamente.' };
  }

  /**
   * Actualiza la contraseña de una cuenta existente.
   *
   * @param identifier Usuario o correo asociado a la cuenta.
   * @param password Nueva contraseña.
   * @returns Resultado de la operación.
   */
  updatePassword(identifier: string, password: string): StoreActionResult {
    const users = this.users();
    const index = users.findIndex(user => this.matches(user, identifier));
    if (index === -1) {
      return { ok: false, message: 'No existe una cuenta asociada a ese usuario o correo.' };
    }

    users[index] = { ...users[index], password };
    this.saveUsers(users);
    return { ok: true, message: 'Contrasena actualizada correctamente. Ya puedes iniciar sesion.' };
  }

  /**
   * Obtiene el listado completo de usuarios registrados.
   *
   * @returns Arreglo de usuarios almacenados localmente.
   */
  listUsers(): User[] {
    return this.users();
  }

  /**
   * Modifica el rol o estado de un usuario desde el panel de administración.
   *
   * @param identifier Usuario o correo de la cuenta a modificar.
   * @param changes Nuevos valores de rol y estado.
   * @returns Resultado de la operación.
   */
  updateUser(identifier: string, changes: Pick<User, 'rol' | 'estado'>): StoreActionResult {
    const users = this.users();
    const index = users.findIndex(user => this.matches(user, identifier));
    if (index === -1) {
      return { ok: false, message: 'No se encontro la cuenta seleccionada.' };
    }
    if (this.matches(users[index], ADMIN_DEFAULT.usuario)) {
      return { ok: false, message: 'La cuenta administradora principal no puede modificarse.' };
    }

    users[index] = { ...users[index], ...changes };
    this.saveUsers(users);
    return { ok: true, message: 'Usuario actualizado correctamente.' };
  }

  /**
   * Actualiza los datos personales del usuario que mantiene una sesión activa.
   *
   * También actualiza la sesión y traslada el carrito y las compras cuando
   * cambia la clave utilizada para identificar al usuario.
   *
   * @param changes Datos editables enviados desde el formulario de perfil.
   * @returns Resultado de la operación con un mensaje para la interfaz.
   */
  updateProfile(changes: {
    nombre: string;
    usuario: string;
    correo: string;
    fechaNacimiento: string;
    direccion: string;
    password?: string;
  }): StoreActionResult {
    const session = this.sessionState();
    if (!session) {
      return { ok: false, message: 'Debes iniciar sesión para actualizar tu perfil.' };
    }

    const users = this.users();
    const index = users.findIndex(user => this.matches(user, session.usuario));
    if (index === -1) {
      return { ok: false, message: 'No se encontró la cuenta asociada a la sesión actual.' };
    }

    const current = users[index];
    const usuario = changes.usuario.trim();
    const correo = changes.correo.trim();
    const duplicate = users.some((user, currentIndex) =>
      currentIndex !== index
      && (this.normalize(user.usuario) === this.normalize(usuario)
        || this.normalize(user.correo) === this.normalize(correo)),
    );
    if (duplicate) {
      return { ok: false, message: 'El usuario o correo ya pertenece a otra cuenta.' };
    }

    if (this.matches(current, ADMIN_DEFAULT.usuario) && this.normalize(usuario) !== this.normalize(ADMIN_DEFAULT.usuario)) {
      return { ok: false, message: 'El usuario de la cuenta administradora principal no puede modificarse.' };
    }

    const previousKey = this.normalize(current.usuario || current.correo);
    const updated: User = {
      ...current,
      nombre: changes.nombre.trim(),
      usuario,
      correo,
      fechaNacimiento: changes.fechaNacimiento,
      direccion: changes.direccion.trim(),
      ...(changes.password ? { password: changes.password } : {}),
    };
    const nextKey = this.normalize(updated.usuario || updated.correo);

    users[index] = updated;
    this.saveUsers(users);
    this.storage.moveLocal(`${STORAGE_CART_PREFIX}${previousKey}`, `${STORAGE_CART_PREFIX}${nextKey}`);
    this.storage.moveLocal(`${STORAGE_PURCHASES_PREFIX}${previousKey}`, `${STORAGE_PURCHASES_PREFIX}${nextKey}`);
    this.setSession(this.toSession(updated));

    return { ok: true, message: 'Perfil actualizado correctamente.' };
  }

  /**
   * Busca un usuario por nombre de usuario o correo electrónico.
   *
   * @param identifier Usuario o correo a comparar.
   * @param users Listado opcional donde realizar la búsqueda.
   * @returns Usuario encontrado o undefined si no existe.
   */
  findUser(identifier: string, users = this.users()): User | undefined {
    return users.find(user => this.matches(user, identifier));
  }

  /**
   * Guarda una sesión activa en memoria y almacenamiento de sesión.
   *
   * @param user Usuario reducido utilizado para representar la sesión.
   */
  setSession(user: SessionUser): void {
    this.storage.writeSession(STORAGE_SESSION_KEY, user);
    this.sessionState.set(user);
  }

  /**
   * Cierra la sesión actual y elimina su registro del almacenamiento de sesión.
   */
  logout(): void {
    this.storage.removeSession(STORAGE_SESSION_KEY);
    this.sessionState.set(null);
  }

  /**
   * Entrega una clave normalizada del usuario autenticado para asociar datos del carrito o compras.
   *
   * @returns Clave del usuario autenticado o null si no hay sesión activa.
   */
  userKey(): string | null {
    const session = this.sessionState();
    return session ? this.normalize(session.usuario || session.correo) : null;
  }

  /**
   * Normaliza textos para comparar usuarios y correos sin distinguir mayúsculas.
   *
   * @param value Texto que debe normalizarse.
   * @returns Texto sin espacios exteriores y convertido a minúsculas.
   */
  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  /**
   * Lee la colección de usuarios almacenada localmente.
   *
   * @returns Usuarios registrados o un arreglo vacío.
   */
  private users(): User[] {
    return this.storage.readLocal<User[]>(STORAGE_USERS_KEY, []);
  }

  /**
   * Guarda la colección completa de usuarios.
   *
   * @param users Usuarios que deben persistirse.
   */
  private saveUsers(users: User[]): void {
    this.storage.writeLocal(STORAGE_USERS_KEY, users);
  }

  /**
   * Comprueba si un usuario coincide con un nombre de usuario o correo.
   *
   * @param user Usuario que será comparado.
   * @param identifier Nombre de usuario o correo buscado.
   * @returns `true` cuando existe coincidencia.
   */
  private matches(user: User, identifier: string): boolean {
    const normalized = this.normalize(identifier);
    return this.normalize(user.usuario) === normalized || this.normalize(user.correo) === normalized;
  }

  /**
   * Extrae los datos necesarios para representar una sesión.
   *
   * @param user Usuario autenticado.
   * @returns Datos públicos que se conservarán en la sesión.
   */
  private toSession(user: User): SessionUser {
    return {
      nombre: user.nombre,
      usuario: user.usuario,
      correo: user.correo,
      rol: user.rol,
    };
  }

  /** Crea o restablece la cuenta administradora principal del sistema. */
  private ensureAdmin(): void {
    const users = this.users();
    const index = users.findIndex(user => this.matches(user, ADMIN_DEFAULT.usuario));
    if (index === -1) {
      this.saveUsers([...users, ADMIN_DEFAULT]);
      return;
    }
    users[index] = { ...users[index], rol: 'admin', estado: 'activo' };
    this.saveUsers(users);
  }
}
