import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import User from '../models/userModel'
import sendJwtToken from '../utils/jwtToken'
import sendEmail from '../utils/sendEmail'
import crypto from 'crypto'
import cloudinary from 'cloudinary'

export const registerUser = catchAsyncError(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: 'scale'
    })

    const { name, email, password } = req.body
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.url
        }
    })

    sendJwtToken(user, 201, res)
})

export const loginUser = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter email and password", 404))
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler("Invalid email or password"))
    }

    const isPasswordMatched = await user.comparePassword(password)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401))
    }
    sendJwtToken(user, 200, res)
})

// logout user 
export const logout = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

// reset password 
export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    // get reset password token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const message = `Your password reset token is : \n\n ${resetPasswordUrl} \n\nIf you have not requested this email than, Please ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: "Ecommerce password recovercy",
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }
})

// reset password 
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new ErrorHandler("Reset Password token is invalid or has been expired", 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not password", 400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
    sendJwtToken(user, 200, res)
})

// get user details
export const getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

// update user password
export const updateUserPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400))
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400))
    }
    user.password = req.body.newPassword
    await user.save()

    sendJwtToken(user, 200, res)
})

// update user profile
export const updateUserProfile = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id)
        const imageId = user.avatar.public_id
        await cloudinary.v2.uploader.destroy(imageId)

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: 'scale'
        })

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.url
        }
    }


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

// get all users --admin
export const getAllUser = catchAsyncError(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

// get single user --admin
export const getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with id: ${req.params.id}`)
        )
    }
    res.status(200).json({
        success: true,
        user
    })
})

// update user role --admin
export const updateUserRole = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    // if (!user) {
    //     return next(new ErrorHandler(`user does not exist with id:${req.user.id}`))
    // }
    res.status(200).json({
        success: true
    })
})

// delete user --admin
export const deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`user does not exist with id:${req.params.id}`))
    }

    await user.remove()
    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })
})