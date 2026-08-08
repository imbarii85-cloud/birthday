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
  // Yeh "inactivity" timeout hai — matlab user 20 min tak kuch bhi
  // (click/scroll/type/mouse move) na kare tabhi session expire hogi.
  // Normal use / back-forward navigate karne se yeh timer reset ho jata hai.
  const TIMEOUT_MINUTES = 20;

  // Default redirect paths
  const DEFAULT_REDIRECT_AFTER_LOGIN = 'index.html';
  const DEFAULT_REDIRECT_AFTER_LOGOUT = 'login.html';

  /**
   * USERS array ke email+password se ek chota sa fingerprint (hash) banata hai.
   * Jab bhi USERS mein email ya password change hoga, yeh fingerprint bhi
   * badal jayega — is se hum pehchan lete hain ke credentials change hue hain.
   */
  function _hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  }

  function _credentialsFingerprint(user) {
    return _hash(`${user.email.toLowerCase().trim()}::${user.password}`);
  }

  /** Save user session to localStorage with Expiry Time */
  function _saveSession(user) {
    const session = {
      email: user.email,
      name: user.name,
      role: user.role,
      loggedInAt: new Date().toISOString(),
      // Current time mein timeout minutes add kar ke expiry time set kar raha hai
      expiresAt: Date.now() + (TIMEOUT_MINUTES * 60 * 1000),
      // Login ke waqt jo email/password thay unka fingerprint save kar rahay hain
      credFingerprint: _credentialsFingerprint(user),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  /** Clear stored session */
  function _clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * Session ki expiry ko aage badha deta hai (sliding timeout).
   * Har page load aur har user-activity par yeh call hota hai,
   * taake active user kabhi beech mein logout na ho.
   */
  function _refreshSession(session) {
    session.expiresAt = Date.now() + (TIMEOUT_MINUTES * 60 * 1000);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
   * Active session ko yahin par refresh (sliding) bhi kar deta hai.
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

      // Ab check karte hain ke USERS array mein wahi email/password abhi bhi
      // maujood hain jo login ke waqt thay. Agar aap ne email ya password
      // change kar diya, toh purana session yahan invalid ho jayega aur
      // user ko dobara login karna parega.
      const currentUser = USERS.find(
        u => u.email.toLowerCase().trim() === (session.email || '').toLowerCase().trim()
      );
      if (!currentUser || _credentialsFingerprint(currentUser) !== session.credFingerprint) {
        _clearSession();
        return false;
      }

      // Session valid hai — expiry ko aage badha do (sliding timeout),
      // taake active user page change/back-forward karne par login na maange.
      _refreshSession(session);

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
      return;
    }
    // User valid hai — ab activity-listeners laga do taake wo page pe
    // active rahe (mouse move/click/scroll/type) toh session expire hi na ho.
    _attachActivityListeners();
  }

  /**
   * User activity par session ko refresh karta rehta hai.
   * Multiple baar attach na ho isliye ek flag rakha hai.
   */
  let _listenersAttached = false;
  function _attachActivityListeners() {
    if (_listenersAttached) return;
    _listenersAttached = true;

    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    // Thoda throttle kar dete hain taake mousemove baar baar localStorage
    // ko na likhe (performance ke liye).
    let lastRefresh = 0;
    const THROTTLE_MS = 5000;

    const onActivity = () => {
      const now = Date.now();
      if (now - lastRefresh < THROTTLE_MS) return;
      lastRefresh = now;

      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      try {
        const session = JSON.parse(raw);
        _refreshSession(session);
      } catch {
        // ignore
      }
    };

    events.forEach(evt => document.addEventListener(evt, onActivity, { passive: true }));
  }

  // Expose public methods
  return { login, logout, isLoggedIn, getUser, requireLogin };

})();
