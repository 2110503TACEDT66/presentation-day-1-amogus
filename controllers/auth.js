const User = require("../models/User");

//@desc   Register user
//@route  POST /api/v1/auth/register
//@access Public
exports.register = async (req, res) => {
  try {
    const { name, tel, email, password, role } = req.body;
    console.log(req.body);
    // Create user
    const user = await User.create({
      name,
      tel,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message || "Cannot register" });
    console.log(err.message);
  }
};

//@desc   Login user
//@route  POST /api/v1/auth/login
//@access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      msg: err.message || "Cannot login",
    });
    console.log(err.stack);
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

//@desc  Get current logged in user
//@route GET /api/v1/auth/me
//@access Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

//@desc  Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, msg: "User logged out successfully" });
};
