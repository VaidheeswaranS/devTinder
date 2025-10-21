const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");
const { User } = require("../models/user");

const requestRouter = express.Router();

// request/send/:status/:userId API - to send "interested" or "ignored" connection to request to others
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const allowedStatus = ["ignored", "interested"];

      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // check 1 - only "interested" or "ignored" is handled in this API
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status,
        });
      }

      /**
       * check 2 -
       * checking if connection request is present already
       * example - if we are sending request from "user1" to "user2", this will check two things
       *  - check if there is already request sent from "user1" to "user2" - case 1
       *  - check if there is already request sent from "user2" to "user1" - case 2
       * basically the two users should have not sent the requests before hand
       */

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId }, // checking case 1
          { fromUserId: toUserId, toUserId: fromUserId }, // checking case 2
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "Connection Request already exist",
        });
      }

      // check 3 - checking if toUserId is present in the DB
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // check 4 - is present in "../models/connectionRequest"

      // only saving to the DB if all the above checks are passed
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      if (status === "interested") {
        res.json({
          message:
            req.user.firstName +
            " " +
            req.user.lastName +
            " " +
            "is " +
            status +
            " in " +
            toUser.firstName +
            " " +
            toUser.lastName,
          data,
        });
      } else if (status === "ignored") {
        res.json({
          message:
            req.user.firstName +
            " " +
            req.user.lastName +
            " " +
            status +
            " " +
            toUser.firstName +
            " " +
            toUser.lastName,
          data,
        });
      }
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

module.exports = requestRouter;
