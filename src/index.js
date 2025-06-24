// require("dotenv").config({path:"./env"});
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({path:"./.env"})
import express from 'express';

import { app } from "./app.js";


connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
}).catch((error) => {
    console.error("Failed to connect to the database:", error);
   // Exit the process if the database connection fails
});

