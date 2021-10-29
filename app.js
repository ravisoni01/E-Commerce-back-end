import express from "express";
import product from './routes/productRoutes'
import user from './routes/userRoutes'
import payment from './routes/paymentRoutes'
import { errors } from './middleware/error'
import cookieParser from "cookie-parser";
import order from './routes/orderRoutes'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import dotenv from 'dotenv'

const app = express()

dotenv.config({ path: "server/config/config.env" })

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())

//import routes
app.use('/api/v1', product)
app.use('/api/v1', user)
app.use('/api/v1', order)
app.use('/api/v1', payment)

// use middleware
app.use(errors)

export default app

