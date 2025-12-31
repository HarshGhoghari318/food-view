const foodModel = require("../models/food.model.js");
const userModel = require("../models/userModel.js");
const { uploadFile } = require("../services/storage.service.js");
import { v4 as uuid } from "uuid";

async function createFood(req, res) {
  const fileResult = await uploadFile(req.file.buffer, uuid());
  console.log(req.foodPartner)

  try {
    const foodData = await foodModel.create({
      name: req.body.name,
      description: req.body.description,
      video: fileResult.url,
      foodPartnerId: req.foodPartner._id,
    });
    res.status(201).json({
      message: "Food created successfully",
      food: foodData,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}


async function getFoods(req, res) {
  const foods = await foodModel
    .find()
    .populate("foodPartnerId")
    .populate("likes")
    .populate("comments.user")
    

  res.status(200).json({
    foods: foods,
  });
}
async function toggleSaveFood(req, res) {
    const { id } = req.params;
    try {
      const food = await foodModel.findById(id);
      if (!food) return res.status(404).json({ message: "Food not found" });
        const userId = req.user._id;
        const idx = food.savedBy?.findIndex((s) => String(s) === String(userId));
        let saved = false;
        if (idx === -1) {
            food.savedBy = food.savedBy || [];
            food.savedBy.push(userId);
            saved = true;
        }
        else {
            food.savedBy.splice(idx, 1);
            saved = false;
        }
        await food.save();

        // persist saved list on the user as well
        try {
          const user = await userModel.findById(userId);
          if (user) {
            user.savedReels = user.savedReels || [];
            if (saved) {
              if (!user.savedReels.some((sid) => String(sid) === String(food._id))) {
                user.savedReels.push(food._id);
              }
            } else {
              user.savedReels = user.savedReels.filter((sid) => String(sid) !== String(food._id));
            }
            await user.save();
            return res.status(200).json({ saved, savedReels: user.savedReels });
          }
        } catch (errUser) {
          console.error("Failed to update user savedReels", errUser);
        }

        res.status(200).json({ saved });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
}
async function toggleLike(req, res) {
  const { id } = req.params;
  try {
    const food = await foodModel.findById(id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    const userId = req.user._id;
    const idx = food.likes.findIndex((l) => String(l) === String(userId));
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
    res.status(500).json({ message: "Server error" });
  }
}

async function addComment(req, res) {
  const { id } = req.params;
  const { text } = req.body;
  if (!text || !text.trim())
    return res.status(400).json({ message: "Comment cannot be empty" });

  if (!req.user) {
    return res.status(401).json({ message: "Please login to comment" });
  }

  try {
    console.log('addComment - params:', id, 'user:', req.user?._id, 'text length:', text ? text.length : 0);
    const food = await foodModel.findById(id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    const comment = { user: req.user._id, text };
    food.comments.push(comment);
    await food.save();

    // reload and populate to get a populated last comment reliably
    const fresh = await foodModel.findById(id).populate('comments.user');
    const last = fresh.comments[fresh.comments.length - 1];

    res.status(201).json({ comment: last, commentsCount: fresh.comments.length });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getComments(req, res) {
  const { id } = req.params;
  try {
    const food = await foodModel.findById(id).populate("comments.user");
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.status(200).json({ comments: food.comments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function shareFood(req, res) {
  const { id } = req.params;
  try {
    const food = await foodModel.findById(id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    food.shares = (food.shares || 0) + 1;
    await food.save();
    res.status(200).json({ shares: food.shares });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createFood,
  getFoods,
  toggleLike,
  addComment,
  getComments,
  shareFood,
  toggleSaveFood
};
