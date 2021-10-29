import { catchAsyncError } from "../middleware/catchAsyncError";
import Stripe from 'stripe'

const stripe = Stripe('sk_test_51JdGB9SHwDaAItWfhgB3SL8W5OBt5aWnuDHz49UQTzlbHCI0owDE5KMo14br5uwMS1bmeNKwpojt0NO1ZITtlo4x00f0X3nzSH')


export const processPayment = catchAsyncError(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
            integration_check: 'accept_a_payment'
        },
    });

    res.status(200).json({ success: true, client_secret: myPayment.client_secret });
})

export const sendStripeApiKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY })
})

