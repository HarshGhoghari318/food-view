const express = require('express');
const app = express();
const connectDB = require('./src/db/db.js');
const foodRoutes = require('./src/routes/food.routes.js');
const authRoutes = require('./src/routes/auth-route.js');
const cookieParser = require('cookie-parser');



connectDB();
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/food',foodRoutes);



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});




