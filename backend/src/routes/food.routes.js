import express from  'express';
import {authFoodPartnerMiddleware,authFoodUserMiddleware} from "../middlewares/auth.middleware.js";
import foodController from "../controller/food.controller.js";
import multer from  'multer';
const router =express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
   
})


router.post("/create",authFoodPartnerMiddleware, upload.single('video'), foodController.createFood)
router.get("/getfoods",authFoodUserMiddleware, foodController.getFoods)


router.post("/like/:id",authFoodUserMiddleware, foodController.toggleLike)
router.post("/comment/:id",authFoodUserMiddleware, foodController.addComment)
router.get("/comments/:id",authFoodUserMiddleware, foodController.getComments)
router.post("/share/:id",authFoodUserMiddleware, foodController.shareFood)
router.post("/save/:id",authFoodUserMiddleware, foodController.toggleSaveFood)


export default router;