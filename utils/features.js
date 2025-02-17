import DataUriParser from "datauri/parser.js"
import path from "path"
import { createTransport } from "nodemailer"



export const getDataUri = (file) => {
    const parser = new DataUriParser()
    const extName = path.extname(file.originalname).toString()
    return parser.format(extName, file.buffer)

}

export const sendToken = (user, res, message, statusCode) => {

    // in case the user is authenticated save the login info in token which will be returned in cookie
    // so whenever the cookies is seing in a browser we will know the user has been authenticated
    const token = user.tokenGenerator()
    res
        .status(statusCode)
        .cookie("token", token, {
            ...cookieOptions,
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }).json({
            success: true,
            message: message,

        })
}

export const cookieOptions = {
    secure: process.env.NODE_ENV === "Development" ? false : true,
    httpOnly: process.env.NODE_ENV === "Development" ? false : true,
    sameSite: process.env.NODE_ENV === "Development" ? false : "none",
}

export const sendEmail = async (subject, to, text) => {
    const transporter = createTransport({
        host:process.env.SMTP_HOST ,
        port: process.env.SMTP_PORT ,
        auth: {
            user: process.env.SMTP_USER ,
            pass: process.env.SMTP_PASS 
        }
    })

}