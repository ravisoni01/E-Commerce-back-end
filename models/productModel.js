import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please Enter product description"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        maxlength: [8, "price cannot exceed 8 characters"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please enter product category"]
    },
    stock: {
        type: String,
        required: [true, "Please enter product stock"],
        maxlength: [4, "Stock cannont exceed 4 character"],
        default: 1
    },
    numOfReviews: {
        type: String,
        default: 0
    },
    reviews: [
        {
            user: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Product', productSchema)