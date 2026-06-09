import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  if (req.method !== "DELETE") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { url } = await req.json();
    if (!url) return new Response("No URL provided", { status: 400 });

    const parsedUrl = new URL(url, "http://localhost");
    const key = parsedUrl.searchParams.get("key");
    if (!key) return new Response("Invalid URL", { status: 400 });

    const store = getStore("portfolio-media");
    await store.delete(key);

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return new Response("Delete failed", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/delete-file",
};
