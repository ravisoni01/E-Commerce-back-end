import express from 'express'
import {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} from '../controllers/orderController'
import { isAuthUser, authorizeRoles } from '../middleware/auth'

const router = express.Router()

router.route('/order/new').post(isAuthUser, newOrder)

router.route('/order/:id').get(isAuthUser, getSingleOrder)

router.route('/orders/me').get(isAuthUser, myOrders)

router.route('/admin/orders').get(isAuthUser, authorizeRoles('admin'), getAllOrders)

router.route('/admin/order/:id').put(isAuthUser, authorizeRoles('admin'), updateOrderStatus)

router.route('/admin/order/:id').delete(isAuthUser, authorizeRoles('admin'), deleteOrder)

export default router