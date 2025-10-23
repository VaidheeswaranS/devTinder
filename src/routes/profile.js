const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { User } = require("../models/user");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();

// /profile/view API - get user details from the DB
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// /profile/edit API - to edit the details from the DB(only "photoUrl", "about" and "skills" can be edited)
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // check 1 - validation of data from request
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit request");
    } else {
      const loggedInUser = req.user;
      Object.keys(req.body).forEach(
        (key) => (loggedInUser[key] = req.body[key])
      );
      await loggedInUser.save();
      res.json({
        message: `${
          loggedInUser.firstName + " " + loggedInUser.lastName
        } your profile is updated successfully`,
        data: loggedInUser,
      });
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// /profile/changePassword API - to change the password if the user wants to change
profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
  try {
    const { emailId, password, newPassword } = req.body;
    const loggedInUser = req.user;

    // check 1 - checking if emailId is valid
    if (!validator.isEmail(emailId)) {
      throw new Error("Not a valid Email ID");
    }

    // check 2 - getting the User info from DB with emailId as filter
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    // check 3 - checking if current password is valid
    const isPasswordValid = await user.validatePassword(password);

    // check 4 - cheking if currentPassword and newPassword are same
    if (password === newPassword) {
      throw new Error("New password cannot be same as old Password");
    }

    // only changing the password if above checks are passed
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    } else {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      loggedInUser.password = passwordHash;
      await loggedInUser.save();
      res.cookie("token", null, { expires: new Date(Date.now()) });
      res.send(
        `${
          loggedInUser.firstName + " " + loggedInUser.lastName
        } your password is updated successfully. Please Login again.`
      );
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// /profile/forgotPassword - to change the password in case of User forgot the current password
profileRouter.patch("/profile/forgotPassword", userAuth, async (req, res) => {
  try {
    const { emailId, newPassword } = req.body;
    const loggedInUser = req.user;

    // check 1 - checking if emailId is valid
    if (!validator.isEmail(emailId)) {
      throw new Error("Not a valid Email ID");
    }

    // check 2 - getting the User info from DB with emailId as filter
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    // only changing the password if above checks are passed
    const passwordHash = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = passwordHash;
    await loggedInUser.save();
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send(
      `${
        loggedInUser.firstName + " " + loggedInUser.lastName
      } your password is updated successfully. Please Login again.`
    );
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
