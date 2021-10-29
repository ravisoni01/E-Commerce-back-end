import app from './app'
import dotenv from 'dotenv'
import connectDatabase from './config/database'
import cloudinary from 'cloudinary'

// handled uncaught exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`)
    console.log('Shutting down the server due to uncaught exception')
    process.exit(1)
})

// import dotenv file
dotenv.config({ path: "server/config/config.env" })
connectDatabase()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// server configuration
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

// unhandled promise rejection
process.on("unhandledRejection", err => {
    console.log(`ERror : ${err.message}`);
    console.log('Shutting down the server due to unhandled promise rejection')
    server.close(() => {
        process.exit(1)
    })
})
