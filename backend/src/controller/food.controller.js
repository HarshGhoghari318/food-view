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
    const foods = await foodModel.find().populate('foodPartnerId').populate('likes').populate('comments.user');

    res.status(200).json({
        foods: foods,
    })
}

async function toggleLike(req, res) {
  const { id } = req.params;
  try {
    const food = await foodModel.findById(id);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    const userId = req.user._id;
    const idx = food.likes.findIndex(l => String(l) === String(userId));
    let liked = false;
    if (idx === -1) {
      food.likes.push(userId);
      liked = true;
    } else {
      food.likes.splice(idx, 1);
      liked = false;
    }
    await food.save();
    res.status(200).json({ liked, likesCount: food.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function addComment(req, res) {
  const { id } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });
  try {
    const food = await foodModel.findById(id);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    const comment = { user: req.user._id, text };
    food.comments.push(comment);
    await food.save();
    // populate last comment user
    const last = food.comments[food.comments.length - 1];
    await last.populate('user');
    res.status(201).json({ comment: last, commentsCount: food.comments.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function getComments(req, res) {
  const { id } = req.params;
  try {
    const food = await foodModel.findById(id).populate('comments.user');
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.status(200).json({ comments: food.comments });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function shareFood(req, res) {
  const { id } = req.params;
  try {
    const food = await foodModel.findById(id);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    food.shares = (food.shares || 0) + 1;
    await food.save();
    res.status(200).json({ shares: food.shares });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {createFood, getFoods, toggleLike, addComment, getComments, shareFood};