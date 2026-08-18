import { Router } from "express";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  summaryByProject,
} from "../controllers/transaction.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", listTransactions);
router.get("/summary", summaryByProject);
router.post("/", upload.single("attachment"), createTransaction);
router.patch("/:id", upload.single("attachment"), updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
