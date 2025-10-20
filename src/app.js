const express = require("express");
const { userAuth } = require("./middlewares/auth");
const { connectDB } = require("./config/database");
const { User } = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");

const app = express();

// this is the middleware provided by Express which will read the request body and convert it into JS object
app.use(express.json());

// this is to read the cookies in the response sent
app.use(cookieParser());

// signup API - this is to register the User in the application
app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
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

// profile API - get user details from the DB
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// sendConnectionRequest API - send request to other users in the application
app.post("/connectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " Sent the connection request");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
      console.log("Server is listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Database connection failed");
    console.error(err);
  });
