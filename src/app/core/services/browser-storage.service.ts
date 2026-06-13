import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserStorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readLocal<T>(key: string, fallback: T): T {
    return this.read(window => window.localStorage, key, fallback);
  }

  writeLocal<T>(key: string, value: T): void {
    this.write(window => window.localStorage, key, value);
  }

  readSession<T>(key: string, fallback: T): T {
    return this.read(window => window.sessionStorage, key, fallback);
  }

  writeSession<T>(key: string, value: T): void {
    this.write(window => window.sessionStorage, key, value);
  }

  removeSession(key: string): void {
    if (this.isBrowser) {
      window.sessionStorage.removeItem(key);
    }
  }

  private read<T>(storage: (window: Window) => Storage, key: string, fallback: T): T {
    if (!this.isBrowser) {
      return fallback;
    }

    try {
      const value = storage(window).getItem(key);
      return value ? JSON.parse(value) as T : fallback;
    } catch {
      return fallback;
    }
  }

  private write<T>(storage: (window: Window) => Storage, key: string, value: T): void {
    if (this.isBrowser) {
      storage(window).setItem(key, JSON.stringify(value));
    }
  }
}
