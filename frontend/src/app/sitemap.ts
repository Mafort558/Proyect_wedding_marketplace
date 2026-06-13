import type { MetadataRoute } from "next";

import { apiFetch } from "@/lib/api";
import { getSiteUrl } from "@/lib/config";
import type { ServiceList, VenueList } from "@/lib/types";

const STATIC_PATHS = ["", "/venues", "/services", "/login", "/register"];

async function fetchVenuePaths(): Promise<string[]> {
  try {
    const venues = await apiFetch<VenueList>("/api/venues");
    return venues.items.map((venue) => `/venues/${venue.id}`);
  } catch {
    return [];
  }
}

async function fetchServicePaths(): Promise<string[]> {
  try {
    const services = await apiFetch<ServiceList>("/api/services");
    return services.items.map((service) => `/services/${service.id}`);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [venuePaths, servicePaths] = await Promise.all([fetchVenuePaths(), fetchServicePaths()]);
  const lastModified = new Date();
  return [...STATIC_PATHS, ...venuePaths, ...servicePaths].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
