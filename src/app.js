const express = require("express");
const { adminAuth, userAuth } = require("./middlewares/auth");
const { connectDB } = require("./config/database");
const { User } = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

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
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // create the JWT token
      const token = jwt.sign({ _id: user._id }, "DEV@Tinder$777");

      // add token to the cookie and send it back to user in response
      res.cookie("token", token);
      res.send("Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error("Token is invalid");
    }

    // validate the token sent by client
    const decodedMessage = jwt.verify(token, "DEV@Tinder$777");
    const { _id } = decodedMessage;

    // getting the user profile from DB
    const user = await User.findById({ _id: _id });
    if (!user) {
      throw new Error("User does not exist");
    }
    res.send(user);
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

// user API - this is to get only one user from the database based on emailId
app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.emailId;
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Something went wrong: " + err.message);
  }
});

// feed API - this is to get all the users in the database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong: " + err.message);
  }
});

// user API(for DELETE) - this is to delete the user from database based on userId
app.delete("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findByIdAndDelete({ _id: userId });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User is deleted successfully");
    }
  } catch (err) {
    res.send(400).send("Something went wrong: " + err.message);
  }
});

// user API (for PATCH) - this is to update the user in the database based on userId
app.patch("/user/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;
    const data = req.body;

    const ALLOWED_FIELDS = ["skills", "photoUrl", "about"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_FIELDS.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (data?.skills.length > 15) {
      throw new Error("Skills cannot be more than 10");
    }

    const user = await User.findByIdAndUpdate(userId, data);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User is updated successfully");
    }
  } catch (err) {
    res.status(400).send("Something went wrong: " + err.message);
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
