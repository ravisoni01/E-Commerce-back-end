import express from 'express'
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReview,
    deleteReview,
    getAdminProducts
} from '../controllers/productController'
import { isAuthUser, authorizeRoles } from '../middleware/auth'

const router = express.Router()

router.route('/products').get(getAllProducts)

router.route('/admin/product/new').post(isAuthUser, authorizeRoles('admin'), createProduct)

router.route('/admin/product/update/:id').put(isAuthUser, authorizeRoles('admin'), updateProduct)

router.route('/admin/product/delete/:id').delete(isAuthUser, authorizeRoles('admin'), deleteProduct)

router.route('/admin/products').get(getAdminProducts)

router.route('/product/:id').get(getProductDetails)

router.route('/review').put(isAuthUser, createProductReview)

router.route('/reviews').get(getProductReview)

router.route('/reviews').delete(isAuthUser, deleteReview)


export default router