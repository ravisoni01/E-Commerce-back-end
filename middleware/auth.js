import ErrorHandler from '../utils/errorHandler'
import { catchAsyncError } from './catchAsyncError'
import jwt from 'jsonwebtoken'
import User from '../models/userModel'

export const isAuthUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies

    if (!token) {
        return next(new ErrorHandler("Please login to access this resourse", 401))
    }
    const decodeData = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decodeData.id)
    next()

})

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Roles (${req.user.role}) is not allowed to access this resource`, 403))
        }
        next()
    }
}