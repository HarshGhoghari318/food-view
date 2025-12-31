import foodPartnerModel from "../models/foodpartner.model.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

async function authFoodPartnerMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Please login first" });
    }
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)

    const foodPartner = await foodPartnerModel.findById(decoded.id); 
    console.log(foodPartner)  
    if(foodPartner) {
        
        req.foodPartner = foodPartner;
    }
    else{
        req.user = "user"
    } 
    next();

    
    }
    catch(err){
        return res.status(401).json({ message: "Invalid token" });
    }
    
}
async function authFoodUserMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        console.log('No auth token present for request to', req.path);
        return res.status(401).json({ message: "Please login first" });

    }
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    req.user = user;

    next();
    }
    catch(err){
        return res.status(401).json({ message: "Invalid token" });
    }
    
}

module.exports = {authFoodPartnerMiddleware,
    authFoodUserMiddleware
};