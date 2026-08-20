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
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(listTransactions));
router.get("/summary", asyncHandler(summaryByProject));
router.post("/", upload.single("attachment"), asyncHandler(createTransaction));
router.patch("/:id", upload.single("attachment"), asyncHandler(updateTransaction));
router.delete("/:id", asyncHandler(deleteTransaction));

export default router;
