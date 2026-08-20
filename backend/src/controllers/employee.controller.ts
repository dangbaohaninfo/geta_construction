import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

export async function listEmployees(_req: Request, res: Response) {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });
  res.json(employees);
}

const createSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
});

export async function createEmployee(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() });
  }
  const employee = await prisma.employee.create({ data: parsed.data });
  res.status(201).json(employee);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function updateEmployee(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() });
  }
  const employee = await prisma.employee.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(employee);
}

export async function deleteEmployee(req: Request, res: Response) {
  await prisma.employee.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
