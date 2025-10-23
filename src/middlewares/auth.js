const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // reading the token from request cookies
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login!");
    }

    // validate the token
    const decodedObj = jwt.verify(token, "DEV@Tinder$777");
    const { _id } = decodedObj;

    // find the user and send back the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User does not exist");
    } else {
      req.user = user;
      next();
    }
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
};

module.exports = {
  userAuth,
};
