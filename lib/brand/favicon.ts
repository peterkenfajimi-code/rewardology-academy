/** Inline SVG favicon — embedded in HTML so it works even when /public assets 404 on Netlify. */
export const FAVICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Rewardology Academy"><defs><linearGradient id="ra-gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c8963e"/><stop offset="100%" stop-color="#e2ac50"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="url(#ra-gold)"/><text x="16" y="22" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-size="18" font-weight="700" fill="#07192e">R</text></svg>';

export const FAVICON_DATA_URL = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`;

export const APPLE_TOUCH_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" role="img" aria-label="Rewardology Academy"><defs><linearGradient id="ra-gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c8963e"/><stop offset="100%" stop-color="#e2ac50"/></linearGradient></defs><rect width="180" height="180" rx="32" fill="url(#ra-gold)"/><text x="90" y="118" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-size="100" font-weight="700" fill="#07192e">R</text></svg>';

export const APPLE_TOUCH_DATA_URL = `data:image/svg+xml,${encodeURIComponent(APPLE_TOUCH_SVG)}`;
