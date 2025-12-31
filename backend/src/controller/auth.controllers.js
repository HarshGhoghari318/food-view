import bcrypt  from "bcryptjs";
import userModel from "../models/userModel.js";
import foodPartnerModel from "../models/foodpartner.model.js";
import jwt from "jsonwebtoken";
import foodModel from "../models/food.model.js";

async function registerUser(req, res) {
  const { fullName, email, password, gender} = req.body;
  console.log(req.body);

  const isUserAlreadyExists = await userModel.findOne({
    email,
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    fullName,
    email,
    password: hashedPassword,
    gender
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  // set cookie with safe defaults for local dev
  res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
  console.log('Set auth cookie for user', user._id);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  // set cookie with safe defaults for local dev
  res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
  console.log('Set auth cookie for user', user._id);

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}

function logoutUser(req, res) {
  res.clearCookie("token", { httpOnly: true, sameSite: 'lax' });
  console.log('Cleared auth cookie for user');
  res.status(200).json({
    message: "User logged out successfully",
  });
}

async function registerFoodPartner(req, res) {
  const { name, email, password, contactName, phone, address } = req.body;
  const isPartnerExists = await foodPartnerModel.findOne({ email });
  if (isPartnerExists) {
    return res.status(400).json({ message: "Food partner already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const foodPartner = await foodPartnerModel.create({
    name,
    email,
    password: hashedPassword,
    contactName,
    phone,
    address,
  });
  // const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);
  // res.cookie("token", token);

  res.status(201).json({
    message: "Food partner registered successfully",
    foodPartner: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
}

async function loginFoodPartner(req, res) {
  const { email, password } = req.body;
  const foodPartner = await foodPartnerModel.findOne({ email });
  if (!foodPartner) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);
  // set cookie for partner login
  res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
  console.log('Set auth cookie for food partner', foodPartner._id);
  res.status(200).json({
    message: "Food partner logged in successfully",
    foodPartner: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
}

function logoutFoodPartner(req, res) {
  res.clearCookie("token", { httpOnly: true, sameSite: 'lax' });
  console.log('Cleared auth cookie for food partner');
  res.status(200).json({
    message: "Food partner logged out successfully",
  });
}

async function getFoodPartner(req, res) {
  const { id } = req.params;
  try {
    const partner = await foodPartnerModel.findById(id)

    const foodItems = await foodModel.find({ foodPartnerId: partner._id });
    if (!partner) return res.status(404).json({ message: 'Food partner not found' });
    res.status(200).json({ partner, foodItems });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
async function getFoodPartnerByName(req, res) {
  
  const { search } = req.params;
  

  try {
    const partners = await foodPartnerModel.find({
     name: { $regex: `^${search}`, $options: "i" }// Case-insensitive search
    });
    
    res.status(200).json({ partners });
  }
  catch(err){
    console.log(err);
  }
 
}

async function getTokenPartner(req,res){
  if(req.user && req.user=="user"){
    res.status(200).json({partner:false})
  }
  else
    {
    try{
    const partner = await foodPartnerModel.findById(req.foodPartner._id)
    console.log(partner)
    res.status(200).json({partner:true})  
  }catch(err){
    console.log(err)
  }
  }
}

async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function toggleFollowPartner(req, res) {
  const { id } = req.params;
  try {
    const partner = await foodPartnerModel.findById(id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    const user = await userModel.findById(req.user._id);
    const idx = user.Following.findIndex(f => String(f) === String(id));
    let followingNow = false;
    if (idx === -1) {
      user.Following.push(id);
      followingNow = true;
    } else {
      user.Following.splice(idx, 1);
      followingNow = false;
    }
    await user.save();
    res.status(200).json({ message: followingNow ? 'followed' : 'unfollowed', following: user.Following, followingNow });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
  getFoodPartner,
  getMe,
  toggleFollowPartner,
  getFoodPartnerByName,
  getTokenPartner
  
};
