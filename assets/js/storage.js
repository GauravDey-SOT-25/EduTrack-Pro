const PREFIX = "edutrack:";

const safelyParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const localStore = {
  get: (key, fallback = null) => safelyParse(localStorage.getItem(`${PREFIX}${key}`), fallback),
  set: (key, value) => localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(`${PREFIX}${key}`)
};

export const sessionStore = {
  get: (key, fallback = null) => safelyParse(sessionStorage.getItem(`${PREFIX}${key}`), fallback),
  set: (key, value) => sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value)),
  remove: (key) => sessionStorage.removeItem(`${PREFIX}${key}`)
};

export const preferences = {
  get theme() {
    return localStore.get("theme", "light");
  },
  set theme(value) {
    localStore.set("theme", value);
  },
  get sidebarCollapsed() {
    return localStore.get("sidebar-collapsed", false);
  },
  set sidebarCollapsed(value) {
    localStore.set("sidebar-collapsed", value);
  },
  get rememberMe() {
    return localStore.get("remember-me", true);
  },
  set rememberMe(value) {
    localStore.set("remember-me", value);
  }
};
