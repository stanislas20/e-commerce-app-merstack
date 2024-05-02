

import { asyncError } from "../middlewares/error.js"
import { User } from "../models/user.js"
import ErrorHandler from "../utils/ErrorHandler.js"
import { cookieOptions, getDataUri, sendEmail, sendToken } from "../utils/features.js"
import cloudinary from "cloudinary"

export const login = asyncError(async (req, res, next) => {

    const { email, password } = req.body

    const user = await User.findOne({ email }).select("+password")

    // Handle error
    if (!user) {
        return next(new ErrorHandler("Incorrect Email or  Password", 400))
    }
    const isMatched = await user.comparePassword(password)

    if (!password) {
        return next(new ErrorHandler("Please Enter Password", 400))
    }

    if (!isMatched) {
        return next(new ErrorHandler("Incorrect Email or  Password", 400))
    }

    // in case the user is authenticated save the login info in token which will be returned in cookie
    // so whenever the cookies is seing in a browser we will know the user has been authenticated

    sendToken(user, res, `Welcome back, ${user.name}`, 200)
}) // asyncError is imported from middlewares/error.js



// For user Registration
export const signup = asyncError(async (req, res, next) => {

    const { name, email, password, address, city, country, pinCode } = req.body

    let user = await User.findOne({ email })

    if (user) return next(new ErrorHandler("User Already Exist", 400))

    let avatar = undefined// you can also use  let avatar = null

    if (req.file) {

        //req.file
        const file = getDataUri(req.file) // this file will be uploaded to cloudinary

        // add cloudinary here....
        const myCloud = await cloudinary.v2.uploader.upload(file.content)

        avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }

    }

    user = await User.create({
        avatar,
        name,
        email,
        password,
        address,
        city,
        country,
        pinCode,
    })
    sendToken(user, res, `Registered successfully`, 201)
})

export const logOut = asyncError(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        ...cookieOptions,
        expires: new Date(Date.now())

    }).json({
        success: true,
        message: "Logged Out Successfully",

    })

})


export const getMyProfile = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id)

    res.status(200).json({
        success: true,
        user
    })

})


export const getAllUserProfile = asyncError(async (req, res, next) => {
    //Search & Category query
    const users = await User.find({})

    res.status(200).json({
        success: true,
        users,
    })
})

export const getUserDetails = asyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) return next(new ErrorHandler("User not Found", 404))

    res.status(200).json({
        success: true,
        user,
    })
})




export const updateProfile = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id)

    const { name, email, address, city, country, pinCode } = req.body

    if (name) user.name = name
    if (email) user.email = email
    if (address) user.address = address
    if (city) user.city = city
    if (country) user.country = country
    if (pinCode) user.pinCode = pinCode

    await user.save()

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully"
    })

})

export const updateUserToAdmin = asyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) return next(new ErrorHandler("User not Found", 404))

    else if (user.role === "user") {
        user.role = "admin"
    }
   // else if (user.role === "admin") {
       // user.role = "user"
   // }
    else return next(new ErrorHandler("User is Already Admin", 400))

    await user.save()

    res.status(200).json({
        success: true,
        message: "User Successfully Updated to Admin"
    })

})


export const changePassword = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id).select("+password")

    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) { return next(new ErrorHandler("Please Enter Old Password & New Password", 400)) }
    // check if the user has typed in the correct old password
    const isMatched = await user.comparePassword(oldPassword)
    // if the user has typed in an incorrect old password throw the error below
    if (!isMatched) { return next(new ErrorHandler("Incorrect Old Password", 400)) }

    user.password = newPassword
    await user.save()
    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })

})


export const updatePic = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id)

    //req.file
    const file = getDataUri(req.file) // this file will be uploaded to cloudinary

    // remove the old picture
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    // add cloudinary here to upload a new image....
    const myCloud = await cloudinary.v2.uploader.upload(file.content)

    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
    }
    await user.save()

    res.status(200).json({
        success: true,
        message: "Avatar updated successfully"
    })

})


export const forgetPassword = asyncError(async (req, res, next) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return next(new ErrorHandler("Incorrect Email", 404))
    // max, min 2000,1000
    //math.random()* (max - min)+ min
    const randomNumber = Math.random() * (999999 - 100000) + 100000
    const otp = Math.floor(randomNumber)
    const otp_expire = 15 * 60 * 1000

    user.otp = otp,
        user.otp_expire = new Date(Date.now() + otp_expire)
    await user.save()
    const message = `Your OTP For Reseting Password is ${otp}. \n Please ignore if you haven't requested this.`

    try {
        await sendEmail("OTP FOR Reseting Password", user.email, message)
    } catch (error) {
        user.otp = null,
            user.otp_expire = null

        await user.save()
        return next(error)

    }

    res.status(200).json({
        success: true,
        message: `Email Sent To ${user.email}`
    })

})

export const resetPassword = asyncError(async (req, res, next) => {
    const { otp, password } = req.body

    const user = await User.findOne({
        otp,
        otp_expire: {
            $gt: Date.now()
        }
    })

    if (!user) return next(new ErrorHandler("Incorrect OTP or has been Expired", 400))
    if (!password) return next(new ErrorHandler("Please Enter new password", 400))
    user.password = password
    user.otp = undefined
    user.otp_expire = undefined
    await user.save()

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully, You can login now",
    })

})



