import express from "express";

import { UserController } from "../controllers/user-controller";
import { HelperController } from "../controllers/helper-controller";

const router = express.Router();

const helperController = new HelperController();
const userController = new UserController();

router.post(
  "/user_exist",
  helperController.checkUserExists.bind(helperController),
);
router.post(
  "/find_user",
  helperController.handleFindUser.bind(helperController),
);

export default router;
