import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) return new Response("No file provided", { status: 400 });

    const store = getStore("portfolio-media");

    let key: string;
    if (type === "resume") {
      key = "resume/resume.pdf";
    } else {
      const ext = file.name.split(".").pop();
      const random = Math.random().toString(36).substring(2, 8);
      key = `media/${Date.now()}-${random}.${ext}`;
    }

    const arrayBuffer = await file.arrayBuffer();
    await store.set(key, arrayBuffer);

    const url = `/api/media?key=${encodeURIComponent(key)}`;
    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return new Response("Upload failed", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/upload",
};
