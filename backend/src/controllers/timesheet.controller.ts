import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

const listQuerySchema = z.object({
  projectId: z.string().optional(),
  employeeId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function listTimesheets(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Tham số không hợp lệ" });
  }
  const { projectId, employeeId, from, to } = parsed.data;

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (employeeId) where.employeeId = employeeId;
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const timesheets = await prisma.timesheet.findMany({
    where,
    include: {
      employee: { select: { id: true, name: true } },
      project: { select: { id: true, name: true, code: true } },
    },
    orderBy: { date: "asc" },
  });
  res.json(timesheets);
}

const upsertSchema = z.object({
  employeeId: z.string().min(1),
  projectId: z.string().min(1),
  date: z.string().min(1),
  hoursWorked: z.coerce.number().min(0).max(24),
  note: z.string().optional(),
});

export async function upsertTimesheet(req: Request, res: Response) {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() });
  }
  const { employeeId, projectId, date, hoursWorked, note } = parsed.data;
  const parsedDate = new Date(date);

  const timesheet = await prisma.timesheet.upsert({
    where: { employeeId_date: { employeeId, date: parsedDate } },
    update: { projectId, hoursWorked, note },
    create: { employeeId, projectId, date: parsedDate, hoursWorked, note, createdById: req.user!.id },
    include: {
      employee: { select: { id: true, name: true } },
      project: { select: { id: true, name: true, code: true } },
    },
  });
  res.json(timesheet);
}

export async function deleteTimesheet(req: Request, res: Response) {
  await prisma.timesheet.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
