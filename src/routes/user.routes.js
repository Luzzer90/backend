import { Router } from "express";
import { loginuser, logoutuser, registeruser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

// router.route("/register").post(registeruser);
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registeruser
    )

    router.route("/login").post(loginuser);
    // secure routes
    router.route("/logout").post(verifyJWT, logoutuser)

export default router;
// This file defines the user routes for the application.