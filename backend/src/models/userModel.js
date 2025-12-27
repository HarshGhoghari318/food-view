const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    Image: { type: String, required: false },
    gender: { type: String, required: true },
    Following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "FoodPartner",
      default: [],
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
