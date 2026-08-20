import { Router } from "express";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "../controllers/employee.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(listEmployees));
router.post("/", requireAdmin, asyncHandler(createEmployee));
router.patch("/:id", requireAdmin, asyncHandler(updateEmployee));
router.delete("/:id", requireAdmin, asyncHandler(deleteEmployee));

export default router;
