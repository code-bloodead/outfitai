const express = require("express");
const {
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  getProductReviews,
  deleteReview,
  createProductReview,
  createProduct,
  getAdminProducts,
  getProducts,
  getTrendingProducts,
  addProductImpression,
  addToWishlist,
  addToCart,
  getProductByAid,
  uploadPersonalizedImage,
} = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const multer = require("multer");

const router = express.Router();

router.route("/trendingProducts").get(getTrendingProducts);

router.route("/products").get(getAllProducts);
router.route("/products/all").get(getProducts);

router
  .route("/product/addToWishlist/:productId")
  .post(isAuthenticatedUser, addToWishlist);

router
  .route("/product/addToCart/:productId")
  .post(isAuthenticatedUser, addToCart);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails).put(addProductImpression);
router.route("/productByAid/:id").get(getProductByAid);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
  .route("/admin/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReview);

  const upload = multer({ dest: "uploads/" });

  router.route("/personalizedImage").post(
    isAuthenticatedUser,
    upload.single("image"),
    uploadPersonalizedImage
  );

module.exports = router;
