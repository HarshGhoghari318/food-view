const express = require('express');
const authMiddleware=require("../middlewares/auth.middleware.js");
const foodController=require("../controller/food.controller.js");

const router = express.Router();


router.post("/",authMiddleware.authFoodPartnerMiddleware, foodController.createFood)








module.exports = router;