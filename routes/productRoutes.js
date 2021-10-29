import express from 'express'
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReview,
    deleteReview
} from '../controllers/productController'
import { isAuthUser, authorizeRoles } from '../middleware/auth'

const router = express.Router()

router.route('/products').get(getAllProducts)

router.route('/product/new').post(isAuthUser, authorizeRoles('admin'), createProduct)

router.route('/product/update/:id').put(isAuthUser, authorizeRoles('admin'), updateProduct)

router.route('/product/delete/:id').delete(isAuthUser, authorizeRoles('admin'), deleteProduct)

router.route('/product/:id').get(getProductDetails)

router.route('/review').put(isAuthUser, createProductReview)

router.route('/reviews').get(getProductReview)

router.route('/reviews').delete(isAuthUser, deleteReview)


export default router