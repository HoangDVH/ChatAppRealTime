import express from "express";
import {
  authMe,
  searchUserByUsername,
  uploadAvatar,
  uploadChatImage,
} from "../controllers/userController.js";
import { upload, uploadChat } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/me", authMe);
router.get("/search", searchUserByUsername);
router.post("/uploadAvatar", upload.single("file"), uploadAvatar);
router.post("/uploadImage", uploadChat.single("file"), uploadChatImage);

export default router;
