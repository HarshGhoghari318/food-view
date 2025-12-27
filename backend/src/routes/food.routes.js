const express = require('express');
const authMiddleware=require("../middlewares/auth.middleware.js");
const foodController=require("../controller/food.controller.js");
const multer = require('multer');
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
   
})


router.post("/create",authMiddleware.authFoodPartnerMiddleware, upload.single('video'), foodController.createFood)
router.get("/getfoods",authMiddleware.authFoodUserMiddleware, foodController.getFoods)

router.post('/:id/like', authMiddleware.authFoodUserMiddleware, foodController.toggleLike)
router.post('/:id/comment', authMiddleware.authFoodUserMiddleware, foodController.addComment)
router.get('/:id/comments', authMiddleware.authFoodUserMiddleware, foodController.getComments)
router.post('/:id/share', authMiddleware.authFoodUserMiddleware, foodController.shareFood)









module.exports = router;