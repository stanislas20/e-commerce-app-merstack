import  express  from "express"
import {config } from "dotenv"
import { errorMiddleware } from "./middlewares/error.js"
import cookieParser from "cookie-parser"



config({
    path: "./data/config.env",

})

export const app = express()

// using middleware
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res, next) => {
    res.send("Working")
})

// importing router
import user from "./routes/user.js"
import product from "./routes/product.js"
import order from "./routes/order.js"
import cors from "cors"

app.use("/api/v1/user", user)
app.use("/api/v1/product", product)
app.use("/api/v1/order", order)
app.use(cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: [process.env.FRONTEND_URI_I,process.env.FRONTEND_URI_2]
}))

// Using Error Middleware
app.use(errorMiddleware)