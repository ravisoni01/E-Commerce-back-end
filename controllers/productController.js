import Product from '../models/productModel'
import ErrorHandler from '../utils/errorHandler'
import { catchAsyncError } from '../middleware/catchAsyncError'
import ApiFeatures from '../utils/apiFeatures'
import Cloudinary from 'cloudinary'


// create product -- admin
export const createProduct = catchAsyncError(async (req, res, next) => {

    let imagesProduct = []

    if (typeof req.body.images === "string") {
        imagesProduct.push(req.body.images)
    } else {
        imagesProduct = req.body.images
    }

    const imagesLink = []

    for (let i = 0; i < imagesProduct.length; i++) {
        const result = await Cloudinary.v2.uploader.upload(imagesProduct[i], {
            folder: "products"
        })

        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }



    const user = req.user.id
    // images = imagesLink

    const { name, description, price, stock, numOfReview, reviews, category } = req.body
    // console.log(req.body[0].name)
    const product = await Product.create({
        name,
        description,
        price,
        images: imagesLink,
        category,
        stock,
        numOfReview,
        reviews,
        user
    })
    res.status(201).json({
        success: true,
        product
    })
})

// get all product
export const getAllProducts = catchAsyncError(async (req, res) => {
    const resultPerPage = 8
    const productCount = await Product.countDocuments()
    const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage)
    const products = await apiFeatures.query
    res.status(200).json({
        success: true,
        productCount,
        resultPerPage,
        products
    })
})

// get all product (Admin)
export const getAdminProducts = catchAsyncError(async (req, res) => {
    const products = await Product.find()
    res.status(200).json({
        success: true,
        products
    })
})

// update product -- admin
export const updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await Cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await Cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true, useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        product
    })
})
// delete product
export const deleteProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    for (let i = 0; i < product.images.length; i++) {
        await Cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    product = await product.remove()
    res.status(200).json({
        success: true,
        message: "Product delete successfully"
    })
})

// get product details
export const getProductDetails = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }
    res.status(200).json({
        success: true,
        product
    })
})

// create new review and update the review
export const createProductReview = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment)
        })
    }
    else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }
    let avg = 0
    product.reviews.forEach((rev) => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true
    })
})

// get all reviews of a product
export const getProductReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id)
    if (!product) {
        return next(new ErrorHandler('Product not found', 404))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// delete review of a product
export const deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if (!product) {
        return next(new ErrorHandler('Product not found', 404))
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())
    let avg = 0
    reviews.forEach((rev) => {
        avg += rev.rating
    })

    const ratings = avg / reviews.length
    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        ratings
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })


    res.status(200).json({
        success: true,
    })
})