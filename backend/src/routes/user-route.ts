import express from "express";
import {
  checkUserExist,
  handleFindUsers,
} from "../controllers/user-controller";

const router = express.Router();

router.post("/user_exist", checkUserExist);
router.post("/find_user", handleFindUsers);

export default router;
