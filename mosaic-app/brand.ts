import brand from "../branding/mosaic-brand.json";

/**
 * Brand constants, read from `branding/mosaic-brand.json` so that the markup,
 * the PWA manifest and the image assets all agree on one value.
 *
 * Change the JSON, not this file.
 */
export const BRAND = brand;

export const BRAND_NAME = brand.name;
export const BRAND_TAGLINE = brand.tagline;
export const BRAND_DESCRIPTION = brand.description;
export const SITE_URL = brand.siteUrl;
export const REPO_URL = brand.repoUrl;
export const SUPPORT_EMAIL = brand.supportEmail;

export const BRAND_COLORS = brand.colors;
