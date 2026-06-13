import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { FavoriteIds } from "@/lib/types";

const EMPTY_FAVORITES: FavoriteIds = { venue_ids: [], service_ids: [] };

export async function fetchFavoriteIds(): Promise<FavoriteIds> {
  const token = await getSessionToken();
  if (token === undefined) {
    return EMPTY_FAVORITES;
  }
  try {
    return await apiFetch<FavoriteIds>("/api/favorites/ids", { token });
  } catch {
    return EMPTY_FAVORITES;
  }
}
