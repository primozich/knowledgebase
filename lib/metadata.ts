import * as cheerio from "cheerio";

export type ReferenceType = "webpage" | "tweet" | "podcast" | "youtube";

export interface FetchedMetadata {
  type: ReferenceType;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, string>;
}

export function detectType(url: string): ReferenceType {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtube.com" || host === "youtu.be") return "youtube";
  if (host === "twitter.com" || host === "x.com") return "tweet";
  // Rough podcast heuristic: common podcast hosts or path contains "episode"
  const podcastHosts = ["podcasts.apple.com", "open.spotify.com", "overcast.fm", "pocketcasts.com", "castro.fm", "podcastaddict.com", "buzzsprout.com", "anchor.fm"];
  if (podcastHosts.some((h) => host.includes(h))) return "podcast";
  return "webpage";
}

async function fetchYouTubeMetadata(url: string): Promise<FetchedMetadata> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error(`YouTube oEmbed failed: ${res.status}`);
  const data = await res.json();
  return {
    type: "youtube",
    title: data.title ?? "Untitled",
    thumbnailUrl: data.thumbnail_url,
    metadata: { author: data.author_name, channelUrl: data.author_url },
  };
}

async function fetchTweetMetadata(url: string): Promise<FetchedMetadata> {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error(`Twitter oEmbed failed: ${res.status}`);
  const data = await res.json();
  // Strip HTML from the tweet html to get plain text description
  const $ = cheerio.load(data.html ?? "");
  const text = $.text().replace(/\s+/g, " ").trim();
  return {
    type: "tweet",
    title: `Tweet by ${data.author_name ?? "Unknown"}`,
    description: text.slice(0, 500),
    metadata: { author: data.author_name, authorUrl: data.author_url, html: data.html },
  };
}

async function fetchPageMetadata(url: string, type: ReferenceType): Promise<FetchedMetadata> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Knowledgebase/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const og = (prop: string) => $(`meta[property="og:${prop}"]`).attr("content");
  const meta = (name: string) => $(`meta[name="${name}"]`).attr("content");

  const title =
    og("title") ?? meta("twitter:title") ?? $("title").text().trim() ?? "Untitled";
  const description = og("description") ?? meta("description") ?? meta("twitter:description");
  const thumbnailUrl = og("image") ?? meta("twitter:image");

  return { type, title, description, thumbnailUrl };
}

export async function fetchMetadata(url: string): Promise<FetchedMetadata> {
  const type = detectType(url);
  if (type === "youtube") return fetchYouTubeMetadata(url);
  if (type === "tweet") return fetchTweetMetadata(url);
  return fetchPageMetadata(url, type);
}
