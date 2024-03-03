const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getCampground, getCampgrounds, createCampground, updateCampground, deleteCampground } = require("../controllers/campground");


// Include other resource routers
const appointmentRouter = require("./appointments");

const router = express.Router();

router.use("/:hospitalId/appointments/", appointmentRouter);

router
  .route("/")
  .get(getCampgrounds)
  .post(protect, authorize("admin"), createCampground);

router
  .route("/:id")
  .get(getCampground)
  .put(protect, authorize("admin"), updateCampground)
  .delete(protect, authorize("admin"), deleteCampground);

module.exports = router;
