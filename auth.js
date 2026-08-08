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

  // 🕒 Yahan apna timeout time set karein (minutes mein)
  const TIMEOUT_MINUTES = 15;

  // Default redirect paths
  const DEFAULT_REDIRECT_AFTER_LOGIN = 'index.html';
  const DEFAULT_REDIRECT_AFTER_LOGOUT = 'login.html';

  /** Save user session to localStorage with Expiry Time */
  function _saveSession(user) {
    const session = {
      email: user.email,
      name: user.name,
      role: user.role,
      loggedInAt: new Date().toISOString(),
      // Current time mein timeout minutes add kar ke expiry time set kar raha hai
      expiresAt: Date.now() + (TIMEOUT_MINUTES * 60 * 1000)
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
   * Returns true if user session is active AND not expired.
   * @returns {boolean}
   */
  function isLoggedIn() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    try {
      const session = JSON.parse(raw);
      const currentTime = Date.now();

      // Check karega ke current time expiry time se aage nikal gaya hai ya nahi
      if (currentTime > session.expiresAt) {
        _clearSession(); // Agar time poora ho gaya, toh session delete kar do
        return false;
      }

      // Agar aap chahte hain ke page refresh karne par time wapis 15 min ho jaye, toh neechay wali 2 lines uncomment karein:
      // session.expiresAt = currentTime + (TIMEOUT_MINUTES * 60 * 1000);
      // localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns current user data or null.
   * @returns {{ email: string, name: string, role: string, loggedInAt: string } | null}
   */
  function getUser() {
    // Data get karne se pehle check karein ke session valid hai ya expire ho chuka hai
    if (!isLoggedIn()) return null;

    const raw = localStorage.getItem(SESSION_KEY);
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Protect a private page (e.g., index.html).
   * Redirects to login page if user is not logged in or session expired.
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