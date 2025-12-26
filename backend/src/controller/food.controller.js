const foodModel = require("../models/food.model.js");
const { uploadFile }= require("../services/storage.service.js");
const {v4 : uuid} = require("uuid");
async function createFood(req, res){

    const fileResult = await uploadFile(req.file.buffer, uuid());
   

    const foodData = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video:fileResult.url,
        foodPartnerId: req.foodPartner._id,
    })

    res.status(201).json({
        "message":"Food created successfully",
        food:foodData,
    })
}

async function getFoods(req, res){
    const foods = await foodModel.find();

    res.status(200).json({
        foods: foods,
    })
}

module.exports = {createFood, getFoods};