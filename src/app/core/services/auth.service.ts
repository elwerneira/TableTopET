import { inject, Injectable, signal } from '@angular/core';

import { SessionUser, StoreActionResult, User } from '../models/store.models';
import { BrowserStorageService } from './browser-storage.service';

const STORAGE_SESSION_KEY = 'tabletop_session';
const STORAGE_USERS_KEY = 'tabletop_users';
const ADMIN_DEFAULT: User = {
  nombre: 'Administrador',
  usuario: 'admin',
  correo: 'admin@tabletopet.cl',
  password: 'Admin123',
  rol: 'admin',
  estado: 'activo',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(BrowserStorageService);
  private readonly sessionState = signal<SessionUser | null>(
    this.storage.readSession<SessionUser | null>(STORAGE_SESSION_KEY, null),
  );

  readonly session = this.sessionState.asReadonly();

  constructor() {
    this.ensureAdmin();
  }

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

  listUsers(): User[] {
    return this.users();
  }

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

  findUser(identifier: string, users = this.users()): User | undefined {
    return users.find(user => this.matches(user, identifier));
  }

  setSession(user: SessionUser): void {
    this.storage.writeSession(STORAGE_SESSION_KEY, user);
    this.sessionState.set(user);
  }

  logout(): void {
    this.storage.removeSession(STORAGE_SESSION_KEY);
    this.sessionState.set(null);
  }

  userKey(): string | null {
    const session = this.sessionState();
    return session ? this.normalize(session.usuario || session.correo) : null;
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private users(): User[] {
    return this.storage.readLocal<User[]>(STORAGE_USERS_KEY, []);
  }

  private saveUsers(users: User[]): void {
    this.storage.writeLocal(STORAGE_USERS_KEY, users);
  }

  private matches(user: User, identifier: string): boolean {
    const normalized = this.normalize(identifier);
    return this.normalize(user.usuario) === normalized || this.normalize(user.correo) === normalized;
  }

  private toSession(user: User): SessionUser {
    return {
      nombre: user.nombre,
      usuario: user.usuario,
      correo: user.correo,
      rol: user.rol,
    };
  }

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
