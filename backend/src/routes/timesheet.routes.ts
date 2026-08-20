import { Router } from "express";
import { listTimesheets, upsertTimesheet, deleteTimesheet } from "../controllers/timesheet.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(listTimesheets));
router.post("/", asyncHandler(upsertTimesheet));
router.delete("/:id", asyncHandler(deleteTimesheet));

export default router;
