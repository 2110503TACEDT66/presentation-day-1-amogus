const Booking = require("../models/Booking.js");
const Campground = require("../models/Campground.js");

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Private
exports.getBookings = async (req, res, next) => {
  let query;
  // General users can see only their bookings!
  if (req.params.campgroundId) {
    query = Booking.find({ hospital: req.params.campgroundId }).populate({
      path: "campground",
      select: "name province tel",
    });
  } else if (req.user.role !== "admin") {
    query = Booking.find({ user: req.user.id }).populate({
      path: "campground",
      select: "name province tel",
    });
  } else {
    query = Booking.find().populate({
      path: "campground",
      select: "name province tel",
    });
  }
  try {
    const bookings = await query;
    console.log(bookings);
    res.status(200).json({
      success: true,
      count: bookings.count,
      data: bookings,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      msg: "Cannot find bookings",
    });
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "campground",
      select: "name description tel",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, msg: "Cannot find booking" });
  }
};

exports.addBooking = async (req, res, next) => {
  try {
    req.body.campground = req.params.campgroundId;

    const campground = await Campground.findById(req.params.campgroundId);

    if (!campground) {
      return res.status(404).json({
        success: false,
        msg: `No campground with the id of ${req.params.campgroundId}`,
      });
    }

    // add user Id to req.body
    req.body.user = req.user.id;
    // Check for existing booking
    const existedBookings = await Booking.find({ user: req.user.id });
    // If the user is not an admin, they can only create 3 bookings
    if (existedBookings.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        msg: `User with ID ${req.user.id} has already made 3 bookings`,
      });
    }

    const booking = await Booking.create(req.body);
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, msg: "Cannot create booking" });
  }
};

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        msg: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is booking owner
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        msg: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, msg: "Cannot update booking" });
  }
};

//@desc Delete booking
//@route DELETE /api/v1/bookings/:id
//@access Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        msg: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is booking owner
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        msg: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, msg: "Cannot delete booking" });
  }
};
