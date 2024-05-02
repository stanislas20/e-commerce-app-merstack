import { asyncError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { stripe } from "../server.js";
import ErrorHandler from "../utils/ErrorHandler.js";


// Processing Payments
export const processPayment = asyncError(async (req, res, next) => {

    const { totalAmount } = req.body
    const { client_secret } = await stripe.paymentIntents.create({
        amount: Number(totalAmount),
        currency: "usd"
    })

    res.status(200).json({
        success: true,
        client_secret,
    })

})


export const createOrder = asyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxAmount,
        shippingCharges,
        totalAmount,
    } = req.body

    await Order.create({
        user: req.user._id,
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxAmount,
        shippingCharges,
        totalAmount,
    })

    //after an order is placed, loop through the product ordered based on the product id and decrease the 
    // stock from the quantity ordered
    for (let index = 0; index < orderItems.length; index++) {
        const product = await Product.findById(orderItems[index].product)
        product.stock -= orderItems[index].quantity
        await product.save()

    }

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully",

    })

})

// Method to get my Orders
export const getMyOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })

    res.status(200).json({
        success: true,
        orders,
    })
})

// Method to get Admin Orders
export const getAdminOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({})

    res.status(200).json({
        success: true,
        orders,
    })
})


export const getOrderDetails = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) return next(new ErrorHandler("Order Not Found", 404))

    res.status(200).json({
        success: true,
        order,
    })
})

export const processOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order Not Found", 404))

    if (order.orderStatus === "Preparing") order.orderStatus = "Shipped"
    else if (order.orderStatus === "Shipped") {
        order.orderStatus = "Delivered"
        order.deliveredAt = new Date(Date.now())
    }
    else return next(new ErrorHandler("Order Already Delivered", 400))

    await order.save()

    res.status(200).json({
        success: true,
        message: "Order Processed Successfully",
    })
})