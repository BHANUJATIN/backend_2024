import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}))

// when data come by filling form
app.use(express.json({limit: "16kb"}))

// another way we get data is from url
// extend here is used for object inside object
app.use(express.urlencoded({extended:true, limit:"16kb"}))
// for keeping static files
app.use(express.static("public"))
// cookie parser is used to crud user browser's cookie
app.use(cookieParser())

// routes
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)


export { app }