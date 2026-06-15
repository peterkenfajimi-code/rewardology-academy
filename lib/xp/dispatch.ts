/** Notify homepage XP widgets to refresh after any XP change. */
export function dispatchXpUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("ra-xp-updated"));
}
