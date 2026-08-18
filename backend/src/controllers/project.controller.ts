import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

export async function listProjects(_req: Request, res: Response) {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  res.json(projects);
}

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  note: z.string().optional(),
});

export async function createProject(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() });
  }
  const existing = await prisma.project.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return res.status(409).json({ message: "Mã công trình đã tồn tại" });
  }
  const project = await prisma.project.create({ data: parsed.data });
  res.status(201).json(project);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  note: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function updateProject(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() });
  }
  const project = await prisma.project.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(project);
}

export async function deleteProject(req: Request, res: Response) {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
