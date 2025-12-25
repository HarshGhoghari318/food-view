const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect("mongodb+srv://harshghogharico22d1_db_user:LsTIf0EpoFtH1hHC@cluster0.qqsf8ky.mongodb.net/food-view")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err);
    });
}

module.exports = connectDB;
