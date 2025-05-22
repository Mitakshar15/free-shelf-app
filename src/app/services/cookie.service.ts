import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly defaultOptions = {
    path: '/',
    secure: window.location.protocol === 'https:',  // Only use secure for HTTPS
    sameSite: 'lax' as 'strict' | 'lax' | 'none'
  };

  /**
   * Set a cookie with the given name and value
   */
  setCookie(name: string, value: string, expirationDays: number = 7): void {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    
    // Create cookie string with proper format
    // The format is critical - spacing and semicolons must be correct
    let cookieString = `${name}=${value}; ${expires}; path=${this.defaultOptions.path}`;
    
    // Add secure flag if needed (only for HTTPS)
    if (this.defaultOptions.secure) {
      cookieString += '; secure';
    }
    
    // Add SameSite attribute (note the proper format without semicolon after the value)
    cookieString += `; SameSite=${this.defaultOptions.sameSite}`;
    
    console.log(`CookieService - Setting cookie with string: ${cookieString}`);
    document.cookie = cookieString;
    
    // Verify the cookie was set
    setTimeout(() => {
      const allCookies = document.cookie;
      console.log(`CookieService - All cookies after setting: ${allCookies}`);
      console.log(`CookieService - Cookie ${name} was ${this.hasCookie(name) ? 'successfully set' : 'NOT set'}`);
    }, 50);
  }

  /**
   * Get a cookie by name
   */
  getCookie(name: string): string | null {
    // Log all cookies for debugging
    console.log(`CookieService - All cookies: ${document.cookie}`);
    
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    // Log each cookie separately for debugging
    ca.forEach((cookie, index) => {
      console.log(`CookieService - Cookie[${index}]: '${cookie.trim()}'`);
    });
    
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
    
    // Try an alternative method to get the cookie using regex
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    if (match) {
      const value = match[2];
      console.log(`CookieService - Retrieved cookie using regex: ${name} (value length: ${value.length})`);
      return value;
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
