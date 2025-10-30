﻿const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    // fetching the data from DB
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({ path: "messages.senderId", select: "firstName lastName" });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

module.exports = chatRouter;
