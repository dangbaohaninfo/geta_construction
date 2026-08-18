import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

const listQuerySchema = z.object({
  projectId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["CHI", "THU"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export async function listTransactions(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Tham số không hợp lệ" });
  }
  const { projectId, categoryId, type, from, to, page, pageSize } = parsed.data;

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (categoryId) where.categoryId = categoryId;
  if (type) where.type = type;
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const [items, total, sumResult] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        category: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({ where, _sum: { amount: true } }),
  ]);

  res.json({
    items,
    total,
    page,
    pageSize,
    totalAmount: sumResult._sum.amount ?? 0,
  });
}

const createSchema = z.object({
  projectId: z.string().min(1),
  categoryId: z.string().min(1),
  type: z.enum(["CHI", "THU"]).default("CHI"),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
  note: z.string().optional(),
});

export async function createTransaction(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() });
  }
  const { projectId, categoryId, type, amount, date, note } = parsed.data;

  const file = req.file;
  const transaction = await prisma.transaction.create({
    data: {
      projectId,
      categoryId,
      type,
      amount,
      date: new Date(date),
      note,
      attachmentUrl: file ? `/uploads/${file.filename}` : undefined,
      attachmentName: file ? file.originalname : undefined,
      createdById: req.user!.id,
    },
    include: {
      project: { select: { id: true, name: true, code: true } },
      category: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  res.status(201).json(transaction);
}

const updateSchema = z.object({
  projectId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  type: z.enum(["CHI", "THU"]).optional(),
  amount: z.coerce.number().positive().optional(),
  date: z.string().min(1).optional(),
  note: z.string().optional(),
});

export async function updateTransaction(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() });
  }
  const { id } = req.params;
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Không tìm thấy giao dịch" });
  if (req.user!.role !== "ADMIN" && existing.createdById !== req.user!.id) {
    return res.status(403).json({ message: "Không có quyền sửa giao dịch này" });
  }

  const file = req.file;
  const { date, ...rest } = parsed.data;
  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...rest,
      ...(date ? { date: new Date(date) } : {}),
      ...(file ? { attachmentUrl: `/uploads/${file.filename}`, attachmentName: file.originalname } : {}),
    },
    include: {
      project: { select: { id: true, name: true, code: true } },
      category: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  res.json(transaction);
}

export async function deleteTransaction(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Không tìm thấy giao dịch" });
  if (req.user!.role !== "ADMIN" && existing.createdById !== req.user!.id) {
    return res.status(403).json({ message: "Không có quyền xóa giao dịch này" });
  }
  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
}

export async function summaryByProject(_req: Request, res: Response) {
  const projects = await prisma.project.findMany({
    include: {
      transactions: { select: { amount: true, type: true } },
    },
  });
  const summary = projects.map((p) => {
    const chi = p.transactions.filter((t) => t.type === "CHI").reduce((s, t) => s + t.amount, 0);
    const thu = p.transactions.filter((t) => t.type === "THU").reduce((s, t) => s + t.amount, 0);
    return { projectId: p.id, projectName: p.name, projectCode: p.code, totalChi: chi, totalThu: thu, count: p.transactions.length };
  });
  res.json(summary);
}
