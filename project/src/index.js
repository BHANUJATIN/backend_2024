// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

import { app } from "./app.js";

connectDB(). 
then( () => {
    app.listen(process.env.PORT || 8080, () => {
        console.log(`Server is running at port:  
        ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Mongodb connection failed !!!", error);
})





















// approch - 2
/*
import express from "express"
const app = express()

( async () => {
    try{
        await mongoose.connect(`${process.env.
        MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: " error);
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is running on port ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/