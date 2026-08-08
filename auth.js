/**
 * auth.js — Client-side authentication module for Birthday Website
 */

const Auth = (() => {

  // ✏️ CREDENTIALS CONFIGURATION
  const USERS = [
    {
      email: 'sehroo@gmail.com',
      password: 'sorry',
      name: 'Sehroo G',
      role: 'admin',
    },
  ];

  // Session key stored in localStorage
  const SESSION_KEY = 'auth_session';

  // Default redirect paths
  const DEFAULT_REDIRECT_AFTER_LOGIN = 'index.html';
  const DEFAULT_REDIRECT_AFTER_LOGOUT = 'login.html';

  /** Save user session to localStorage */
  function _saveSession(user) {
    const session = {
      email: user.email,
      name: user.name,
      role: user.role,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  /** Clear stored session */
  function _clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * Attempt to log in with given credentials.
   * @param {string} email 
   * @param {string} password 
   * @returns {{ success: boolean, message?: string, redirect?: string }}
   */
  function login(email, password) {
    const emailLower = (email || '').toLowerCase().trim();
    const user = USERS.find(
      u => u.email.toLowerCase() === emailLower && u.password === password
    );

    if (!user) {
      return {
        success: false,
        message: 'Password ya Email galat hai janu! Phir se try karein 🙈'
      };
    }

    _saveSession(user);
    return {
      success: true,
      redirect: user.redirect || DEFAULT_REDIRECT_AFTER_LOGIN,
    };
  }

  /**
   * Log out current user and redirect.
   * @param {string} [redirectTo] - Optional custom redirect path.
   */
  function logout(redirectTo) {
    _clearSession();
    window.location.href = redirectTo || DEFAULT_REDIRECT_AFTER_LOGOUT;
  }

  /**
   * Returns true if user session is active.
   * @returns {boolean}
   */
  function isLoggedIn() {
    return !!localStorage.getItem(SESSION_KEY);
  }

  /**
   * Returns current user data or null.
   * @returns {{ email: string, name: string, role: string, loggedInAt: string } | null}
   */
  function getUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Protect a private page (e.g., index.html).
   * Redirects to login page if user is not logged in.
   * @param {string} [loginPage] 
   */
  function requireLogin(loginPage) {
    if (!isLoggedIn()) {
      window.location.href = loginPage || DEFAULT_REDIRECT_AFTER_LOGOUT;
    }
  }

  // Expose public methods
  return { login, logout, isLoggedIn, getUser, requireLogin };

})();