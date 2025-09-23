import express from "express";

import { UserController } from "../controllers/user-controller";

const router = express.Router();

const userController = new UserController();

router.post("/user_exist", userController.checkUserExists.bind(userController));
router.post("/find_user", userController.handleFindUser.bind(userController));

export default router;
