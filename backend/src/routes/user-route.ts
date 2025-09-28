import express from "express";

import { HelperController } from "../controllers/helper-controller";
import { UserController } from "../controllers/user-controller";

const router = express.Router();

const helperController = new HelperController();
const userController = new UserController();

router.post(
  "/user_exist",
  helperController.checkUserExists.bind(helperController),
);
router.post(
  "/find_user",
  helperController.handleFindUserByPhone.bind(helperController),
);
router.get("/currentUser", userController.getCurrentUser.bind(userController));

export default router;
