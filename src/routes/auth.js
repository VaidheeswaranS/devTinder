const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

const authRouter = express.Router();

// signup API - this is to register the User in the application
authRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      photoUrl,
      about,
      skills,
    } = req.body;

    // validation of data
    validateSignUpData(req);

    // encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // save the user in DB
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      photoUrl,
      about,
      skills,
    });

    await user.save();
    res.send("User Added successfully");
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

// login API - this is to login the user into the application
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // checking if emailId is valid
    if (!validator.isEmail(emailId)) {
      throw new Error("Not a valid Email ID");
    }

    // getting the User info from DB with emailId as filter
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    // checking the password in the DB
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // creating the JWT token
      const token = await user.getJWT();

      // add token to the cookie and send it back to user in response
      res.cookie("token", token, {
        expires: new Date(Date.now() + 10 * 3600000),
      });
      res.send("Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = authRouter;
