import { Router } from "express";
import { listProjects, createProject, updateProject, deleteProject } from "../controllers/project.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", listProjects);
router.post("/", requireAdmin, createProject);
router.patch("/:id", requireAdmin, updateProject);
router.delete("/:id", requireAdmin, deleteProject);

export default router;
