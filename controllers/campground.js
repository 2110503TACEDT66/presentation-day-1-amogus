const Campground = require("../models/Campground");
const multer = require("multer");
const upload = multer();

// @desc    Get all campground
// @route   GET /api/v1/campgrounds
// @access  Public
exports.getCampgrounds = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Feilds to exclude
    const removeFields = ["select", "sort"];

    // Loop over to remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    query = Campground.find(JSON.parse(queryStr)).populate("bookings");

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Campground.countDocuments();
    query = query.skip(startIndex).limit(limit);
    // Execute query
    const campgrounds = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res
      .status(200)
      .json({ success: true, count: campgrounds.length, data: campgrounds });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single campground
// @route   GET /api/v1/campgrounds/:id
// @access  Public
exports.getCampground = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new campground
// @route   POST /api/v1/campgrounds
// @access  Private
exports.createCampground = async (req, res) => {
  try {
    //create array of base64 images
    if(req.files) {
      const images = req.files.map((file) => {
      //also set the content type
        return {
          data: file.buffer.toString("base64"),
          contentType: file.mimetype,
        };
      });
      req.body.images = images;
    }
    const campground = await Campground.create(req.body);

    res.status(201).json({ success: true, data: campground });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }

};

// @desc    Update campground
// @route   PUT /api/v1/campgrounds/:id
// @access  Private
exports.updateCampground = async (req, res) => {
  try {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete campground
// @route   DELETE /api/v1/campgrounds/:id
// @access  Private
exports.deleteCampground = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    await campground.deleteOne();

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc get image
// @route GET /api/v1/campgrounds/:id/image/:index
// @access Private
exports.getImage = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(400).json({ success: false });
    }
    const image = campground.images[req.params.index];
    const img = Buffer.from(image.data, "base64");
    res.contentType(image.contentType);
    res.send(img);
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
