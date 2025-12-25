const express = require('express');
const app = express();
const connectDB = require('./src/db/db.js');
const authRoutes = require('./src/routes/auth-route.js');
connectDB();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});




