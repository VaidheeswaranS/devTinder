const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestRouter = express.Router();

// sendConnectionRequest API - send request to other users in the application
requestRouter.post("/connectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " Sent the connection request");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = requestRouter;
