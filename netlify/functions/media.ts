import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  pdf: "application/pdf",
};

export default async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) return new Response("No key provided", { status: 400 });

  try {
    const store = getStore("portfolio-media");
    const blob = await store.get(key, { type: "blob" });
    if (!blob) return new Response("Not found", { status: 404 });

    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Failed to retrieve media", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/media",
};
