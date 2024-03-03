const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getCampground, getCampgrounds, createCampground, updateCampground, deleteCampground ,getImage} = require("../controllers/campground");
const multer = require("multer");
const upload = multer();

// Include other resource routers
const bookingRouter = require("./bookings");

const router = express.Router();

router.use("/:campgroundId/bookings/", bookingRouter);

router
  .route("/")
  .get(getCampgrounds)
  .post(protect, authorize("admin"), upload.array("image"),createCampground);

  
router.route("/:id/image/:index").get(protect,getImage);

router
  .route("/:id")
  .get(getCampground)
  .put(protect, authorize("admin"), updateCampground)
  .delete(protect, authorize("admin"), deleteCampground);


module.exports = router;
