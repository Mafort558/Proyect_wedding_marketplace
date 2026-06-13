const DEFAULT_API_BASE_URL = "http://localhost:8000";
const DEFAULT_SITE_URL = "http://localhost:3000";

export const SESSION_COOKIE_NAME = "access_token";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function getSiteUrl(): string {
  return process.env.SITE_URL ?? DEFAULT_SITE_URL;
}
