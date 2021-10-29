import express from 'express'
import { isAuthUser } from '../middleware/auth'
import { processPayment, sendStripeApiKey } from '../controllers/paymentController'

const route = express.Router()

route.route('/payment/process').post(isAuthUser, processPayment)
route.route('/stripeapikey').get(isAuthUser, sendStripeApiKey)

export default route
