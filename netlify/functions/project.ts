import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { projects } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const id = parseInt(context.params.id);
  if (isNaN(id)) return new Response("Invalid ID", { status: 400 });

  if (req.method === "GET") {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) return new Response("Not found", { status: 404 });
    return Response.json(project);
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const [project] = await db
      .update(projects)
      .set({
        title: body.title,
        category: body.category,
        description: body.description,
        software: body.software,
        year: body.year,
        images: body.images,
        thumbnail: body.thumbnail,
        video: body.video,
        breakdowns: body.breakdowns,
      })
      .where(eq(projects.id, id))
      .returning();
    if (!project) return new Response("Not found", { status: 404 });
    return Response.json(project);
  }

  if (req.method === "DELETE") {
    await db.delete(projects).where(eq(projects.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/projects/:id",
};
