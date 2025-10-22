const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");
const { User } = require("../models/user");

const userRouter = express.Router();

const USER_DATA = "firstName lastName age gender photoUrl about skills";

// /user/requests/received - this API will get all the pending connection requests for the User
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_DATA);
    if (connectionRequests.length === 0) {
      res.json({ message: "No new requests !!" });
    } else {
      const data = connectionRequests;
      res.json({ message: "data fetched successfully", data });
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// /user/connections API - this will get all the accepted connections for the User
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_DATA)
      .populate("toUserId", USER_DATA);
    if (connectionRequests.length === 0) {
      res.json({ message: "No connection requests. Make connections !!!" });
    } else {
      const data = connectionRequests.map((row) => {
        if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
          return row.toUserId;
        } else {
          return row.fromUserId;
        }
      });
      res.json({ message: "data fetched successfully", data });
    }
  } catch (err) {
    res.status(400).send("EROR: " + err.message);
  }
});

// /users/feed API - this will get the profiles of all the users in the application

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    /**
     * We are sending only 15 users at a time for the User in the feed - this is called "Pagination"
     * /feed?page=1&limit=15 => 1-15 => .skip(0) & .limit(15)
     * /feed?page=2&limit=15 => 16-30 => .skip(15) & .limit(15)
     * /feed?page=3&limit=15 => 31-45 => .skip(30) & .limit(15)
     * /feed?page=4&limit=15 => 46-60 => .skip(45) & .limit(15)
     * FORMULA for skip = (page-1)*limit;
     */

    const page = parseInt(req.query.page) || 1; // defaults to the page 1
    let limit = parseInt(req.query.limit) || 15; // defaults to 15
    limit = limit > 50 ? 50 : limit; // defaulting the limit to 50 if the limit in req.query is given more than 50 to save huge DB operation
    const skip = (page - 1) * limit;

    /**
     * User should see all the cards except
     *  1) his own card
     *  2) cards that which he has already sent "interested" or "ignored"
     *  3) cards that already are a connection
     *  4) cards that "accepted" or "rejected" his request
     * Example - Platform has 5 Users => [Vaidhee, Virat, Rohit, Dhoni, Rahul]
     * scenario 1 - (New user)
     * Vaidhee is new to platform and not sent any request to anyone - Vaidhee should see everybody in the platform => [Virat, Rohit, Dhoni, Rahul] in his feed
     * scenario 2 - (checking "accepted" and "rejected" status)
     * (Vaidhee -> Virat and Virat "accepted" or "rejected" request ) => Vaidhee should see only [Rohit, Dhoni, Rahul] in his feed
     * scenario 3 - (checking "interested" status)
     * (Vaidhee -> Virat and Virat DID NOT "accepted" or "rejected" request ) => Vaidhee should see only [Rohit, Dhoni, Rahul] in his feed
     * scenario 4 - (checking "ignored" status)
     * (Vaidhee "ignored" Virat) => Vaidhee should see only [Rohit, Dhoni, Rahul] in his feed
     * scenario 5 - (checking self user)
     * Vaidhee should never see "Vaidhee" in his feed
     */
    const loggedInUser = req.user;

    // finding all connection requests, both "sent" and "received" - this will basically check "interested", "ignored", "accepted" and "rejected" for the Logged in User
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set(); // creating the Set to avoid any duplicate elements
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // fetching from "Users" collection for list of users
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } }, // $nin - "nonIn" - this is checking ID's not in the list of "hideUsersFromFeed"
        { _id: { $ne: loggedInUser._id } }, // $ne - "notEquals - this is checking for same User who has logged in
      ],
    })
      .select(USER_DATA)
      .skip(skip)
      .limit(limit);

    if (users.length === 0) {
      return res.json({
        message:
          "Sorry.. You have sent connection request for all the users in the platform!! Please check in the Connections tab",
      });
    }

    res.send(users);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;
