export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

export const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export const clamp = (value, min = 0, max = 100) => Math.min(Math.max(Number(value) || 0, min), max);
export const percentage = (value, maximum = 100) => maximum ? Math.round((Number(value) / maximum) * 100) : 0;

export const formatPercent = (value, digits = 0) => `${Number(value || 0).toFixed(digits)}%`;
export const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
export const formatGpa = (value) => Number(value || 0).toFixed(2);

export const formatDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) => {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat(undefined, options).format(date) : "Not available";
};

export const formatRelativeDate = (value) => {
  const date = toDate(value);
  if (!date) return "Recently";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  const unit = units.find(([, interval]) => Math.abs(seconds) >= interval);
  if (!unit) return "Just now";
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round(seconds / unit[1]), unit[0]);
};

export const toDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const average = (items = []) => items.length
  ? Math.round(items.reduce((sum, item) => sum + (Number(item) || 0), 0) / items.length)
  : 0;

export const debounce = (callback, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
};

export const slugify = (value = "") => value.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const getInitials = (name = "User") => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

export const errorMessage = (error) => {
  const messages = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "We could not reach the network. Check your connection and try again.",
    "auth/requires-recent-login": "For security, please sign in again before making this change.",
    "permission-denied": "You do not have permission to view this information.",
    "unavailable": "The service is temporarily unavailable. Please try again."
  };
  return messages[error?.code] || error?.message || "Something went wrong. Please try again.";
};

export const pageName = () => document.body.dataset.page || "dashboard";

export const redirectTo = (path) => window.location.assign(path);
