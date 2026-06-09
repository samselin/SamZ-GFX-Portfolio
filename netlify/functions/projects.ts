import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { projects } from "../../db/schema.js";
import { desc } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method === "GET") {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return Response.json(allProjects);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const [project] = await db
      .insert(projects)
      .values({
        title: body.title,
        category: body.category,
        description: body.description || "",
        software: body.software || [],
        year: body.year || new Date().getFullYear(),
        images: body.images || [],
        thumbnail: body.thumbnail || "",
        video: body.video || "",
        breakdowns: body.breakdowns || [],
      })
      .returning();
    return Response.json(project, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/projects",
};
