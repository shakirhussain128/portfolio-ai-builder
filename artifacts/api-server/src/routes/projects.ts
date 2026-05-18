import { Router, type IRouter } from "express";
import { eq, desc, and, gte, count } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  DuplicateProjectParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects/stats", async (req, res): Promise<void> => {
  const userId = req.user?.id ?? null;

  const [totalResult] = userId
    ? await db
        .select({ value: count() })
        .from(projectsTable)
        .where(eq(projectsTable.userId, userId))
    : [{ value: 0 }];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [recentResult] = userId
    ? await db
        .select({ value: count() })
        .from(projectsTable)
        .where(
          and(
            eq(projectsTable.userId, userId),
            gte(projectsTable.createdAt, thirtyDaysAgo),
          ),
        )
    : [{ value: 0 }];

  res.json({
    total: totalResult?.value ?? 0,
    recentCount: recentResult?.value ?? 0,
  });
});

router.get("/projects", async (req, res): Promise<void> => {
  const userId = req.user?.id ?? null;

  if (!userId) {
    res.json([]);
    return;
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .orderBy(desc(projectsTable.updatedAt));

  res.json(projects);
});

router.post("/projects", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({
      ...parsed.data,
      userId: req.user.id,
    })
    .returning();

  res.status(201).json(project);
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.userId && project.userId !== req.user?.id) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(project);
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (existing.userId && existing.userId !== req.user?.id) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [project] = await db
    .update(projectsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  res.json(project);
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (existing.userId && existing.userId !== req.user?.id) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id));

  res.sendStatus(204);
});

router.post("/projects/:id/duplicate", async (req, res): Promise<void> => {
  const params = DuplicateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (existing.userId && existing.userId !== req.user?.id) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [duplicate] = await db
    .insert(projectsTable)
    .values({
      userId: existing.userId,
      title: `${existing.title} (Copy)`,
      prompt: existing.prompt,
      html: existing.html,
      css: existing.css,
      js: existing.js,
      template: existing.template,
    })
    .returning();

  res.status(201).json(duplicate);
});

export default router;
