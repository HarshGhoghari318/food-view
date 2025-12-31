import express from  'express';
import authMiddleware from "../middlewares/auth.middleware.js";
import foodController from "../controller/food.controller.js";
import multer from  'multer';
const router =express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
   
})


router.post("/create",authMiddleware.authFoodPartnerMiddleware, upload.single('video'), foodController.createFood)
router.get("/getfoods",authMiddleware.authFoodUserMiddleware, foodController.getFoods)


router.post("/like/:id",authMiddleware.authFoodUserMiddleware, foodController.toggleLike)
router.post("/comment/:id",authMiddleware.authFoodUserMiddleware, foodController.addComment)
router.get("/comments/:id",authMiddleware.authFoodUserMiddleware, foodController.getComments)
router.post("/share/:id",authMiddleware.authFoodUserMiddleware, foodController.shareFood)
router.post("/save/:id",authMiddleware.authFoodUserMiddleware, foodController.toggleSaveFood)


export default router;