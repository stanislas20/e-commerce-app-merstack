import { User } from "../models/user.js"
import ErrorHandler from "../utils/ErrorHandler.js"
import jwt from "jsonwebtoken"
import { asyncError } from "./error.js"

export const isAuthenticated = asyncError(
    async (req, res, next) => {

        const { token } = req.cookies
        if (!token) return next(new ErrorHandler("Not Logged In", 401))

        const decodedData = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decodedData._id)

        next()
    }
)

export const isAdmin = asyncError(
    async (req, res, next) => {
    if (req.user.role !== "admin"){
        return next(new ErrorHandler("Only Admin Allowed", 401))
    }
    next()
})

/*
export const convertUserToAdmin = asyncError(async (req, res, next) => {

    if (req.user.role === "user"){
        req.user.role = "admin"
    }
        return next(next(new ErrorHandler("User is already an admin", 401)))
    next()
})
*/
