import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.expenseCategory.findMany({ orderBy: { createdAt: "desc" } });
  res.json(categories);
}

const createSchema = z.object({ name: z.string().min(1) });

export async function createCategory(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
  const existing = await prisma.expenseCategory.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return res.status(409).json({ message: "Danh mục đã tồn tại" });
  }
  const category = await prisma.expenseCategory.create({ data: parsed.data });
  res.status(201).json(category);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function updateCategory(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
  const category = await prisma.expenseCategory.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  await prisma.expenseCategory.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
