import express from "express";

import { HelperController } from "../controllers/helper-controller";

const router = express.Router();

const helperController = new HelperController();

router.post(
  "/user_exist",
  helperController.checkUserExists.bind(helperController),
);
router.post(
  "/find_user",
  helperController.handleFindUserByPhone.bind(helperController),
);

export default router;
