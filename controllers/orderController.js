import Order from '../models/orderModel'
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import Product from '../models/productModel';

// create new order
export const newOrder = catchAsyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    })
    res.status(200).json({
        success: true,
        order
    })
})

// get single order
export const getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return (new ErrorHandler("Order not found with this ID", 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// my orders
export const myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })

    res.status(200).json({
        success: true,
        orders
    })
})

// get all orders -- admin
export const getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find()
    let totalAmount = 0
    orders.forEach((order) => {
        totalAmount += order.totalPrice
    })
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// update order status -- admin
export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return (new ErrorHandler("Order not found with this ID", 404))
    }
    if (order.OrderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 400))
    }

    order.orderItems.forEach(async o => {
        await updateStock(o.product, o.quantity)
    })
    order.orderStatus = req.body.status
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now()
    }

    await order.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true,
        order
    })
})
async function updateStock(id, quantity) {
    const product = await Product.findById(id)
    product.stock -= quantity
    await product.save({ validateBeforeSave: false })
}

// delete orders -- admin
export const deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return (new ErrorHandler("Order not found with this ID", 404))
    }
    await order.remove()
    res.status(200).json({
        success: true
    })
})