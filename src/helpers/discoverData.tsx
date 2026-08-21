const DISCOVER_API_BASE = "http://192.168.1.100:3000/api";

export interface DiscoverFeedTag {
  id: number;
  slug: string;
}

export interface DiscoverFeed {
  id: number;
  title: string;
  description: string;
  link: string;
  host: string;
  kind: string;
  tags: DiscoverFeedTag[];
}

export interface DiscoverPagination {
  count: number;
  page: number;
  limit: number;
  last: number;
  in: number;
  from: number;
  to: number;
  series: string[];
}

export interface DiscoverFilters {
  tags: string[];
  countries: string[];
  languages: string[];
}

export interface DiscoverMetadata {
  pagination: DiscoverPagination;
  filters: DiscoverFilters;
}

export interface DiscoverResponse {
  feeds: DiscoverFeed[];
  metadata: DiscoverMetadata;
}

export interface DiscoverParams {
  q?: string;
  tags?: string[];
  language?: string;
  page?: number;
}

export async function fetchDiscoverFeeds(
  params: DiscoverParams
): Promise<DiscoverResponse> {
  const url = new URL(`${DISCOVER_API_BASE}/feeds`);

  if (params.q) url.searchParams.set("q", params.q);
  if (params.tags && params.tags.length > 0) {
    params.tags.forEach((t) => url.searchParams.append("tags[]", t));
  }
  if (params.language) url.searchParams.set("language", params.language);
  if (params.page && params.page > 1)
    url.searchParams.set("page", String(params.page));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<DiscoverResponse>;
}
