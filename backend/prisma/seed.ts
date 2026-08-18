import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@geta.local" },
    update: {},
    create: {
      name: "Quản trị viên",
      email: "admin@geta.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const staffPasswordHash = await bcrypt.hash("Staff@123", 10);
  await prisma.user.upsert({
    where: { email: "staff@geta.local" },
    update: {},
    create: {
      name: "Nhân viên",
      email: "staff@geta.local",
      passwordHash: staffPasswordHash,
      role: "STAFF",
    },
  });

  const categories = ["Vật tư", "Nhân công", "Máy móc thiết bị", "Vận chuyển", "Chi phí khác"];
  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const projects = [
    { code: "CT001", name: "Công trình Nhà xưởng A" },
    { code: "CT002", name: "Công trình Văn phòng B" },
  ];
  for (const p of projects) {
    await prisma.project.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log("Seed thành công. Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
