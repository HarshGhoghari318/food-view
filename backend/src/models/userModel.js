import mongoose from "mongoose";

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
    savedReels: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Food",
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
