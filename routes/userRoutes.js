import express from "express"
import {
    registerUser, loginUser,
    logout, forgetPassword,
    resetPassword, getUserDetails,
    updateUserPassword, updateUserProfile,
    getAllUser, getSingleUser,
    updateUserRole, deleteUser
} from '../controllers/userController'
const route = express.Router()
import { isAuthUser, authorizeRoles } from '../middleware/auth'

route.route('/register').post(registerUser)

route.route('/login').post(loginUser)

route.route('/logout').get(logout)

route.route('/password/forget').post(forgetPassword)

route.route('/password/reset/:token').put(resetPassword)

route.route('/me').get(isAuthUser, getUserDetails)

route.route('/password/update').put(isAuthUser, updateUserPassword)

route.route('/me/update').put(isAuthUser, updateUserProfile)

route.route('/admin/users').get(isAuthUser, authorizeRoles('admin'), getAllUser)

route.route('/admin/user/:id').get(isAuthUser, authorizeRoles('admin'), getSingleUser)

route.route('/admin/user/:id').put(isAuthUser, authorizeRoles('admin'), updateUserRole)

route.route('/admin/user/:id').delete(isAuthUser, authorizeRoles('admin'), deleteUser)

export default route
