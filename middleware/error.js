import ErrorHandler from "../utils/errorHandler";

export const errors = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"

    if (err.name === "CastError") {
        const message = `Resource not found: ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }

    if (err.name === 'JsonwebTokenError') {
        const message = "json web token is invalid try again"
        err = new ErrorHandler(message, 400)
    }

    if (err.name === 'TokenExpireError') {
        const message = "json web token is expire try again"
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.stack
    })
}