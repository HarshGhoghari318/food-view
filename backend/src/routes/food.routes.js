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









module.exports = router;