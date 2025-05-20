import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly defaultOptions = {
    path: '/',
    secure: true,
    sameSite: 'strict' as 'strict' | 'lax' | 'none'
  };

  /**
   * Set a cookie with the given name and value
   */
  setCookie(name: string, value: string, expirationDays: number = 7): void {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    
    // Create cookie string with secure and httpOnly flags
    const cookieString = `${name}=${value}; ${expires}; path=${this.defaultOptions.path}; ${this.defaultOptions.secure ? 'secure;' : ''} sameSite=${this.defaultOptions.sameSite}`;
    document.cookie = cookieString;
    console.log(`CookieService - Setting cookie: ${name} (value length: ${value.length}), expires: ${date.toUTCString()}`);
  }

  /**
   * Get a cookie by name
   */
  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        console.log(`CookieService - Retrieved cookie: ${name} (value length: ${value.length})`);
        return value;
      }
    }
    console.log(`CookieService - Cookie not found: ${name}`);
    return null;
  }

  /**
   * Delete a cookie by name
   */
  deleteCookie(name: string): void {
    const cookieString = `${name}=; Max-Age=-99999999; path=${this.defaultOptions.path}`;
    document.cookie = cookieString;
    console.log(`CookieService - Deleted cookie: ${name}`);
  }

  /**
   * Check if a cookie exists
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }
}
