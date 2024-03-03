const mongoose = require("mongoose");

const CampgroundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be longer than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postalcode"],
      maxlength: [5, "Postal Code can not be more than 5 digits"],
    },
    tel: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete bookings when a camground is deleted
CampgroundSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Bookings being removed from campground: ${this._id}`);

    await this.model("Booking").deleteMany({ campground: this._id });

    next();
  }
);

// Reverse populate with virtuals
CampgroundSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "hospital",
  justOne: false,
});

module.exports = mongoose.model("Campground", CampgroundSchema);
