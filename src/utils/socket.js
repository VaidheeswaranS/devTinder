const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const { ConnectionRequest } = require("../models/connectionRequest");

const getHashedRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      // creating a unique room ID where the userId and targetUserId both will be connected to chat
      const roomId = getHashedRoomId(userId, targetUserId);
      console.log(firstName + " joined room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          // check 1 - checking if the two participants (userId and targetUserId) is already a connection
          const isConnection = await ConnectionRequest.findOne({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
                status: "accepted",
              },
              {
                fromUserId: targetUserId,
                toUserId: userId,
                status: "accepted",
              },
            ],
          });

          if (!isConnection) {
            throw new Error(
              "You cannot send chat to people who are not in your connections"
            );
          }

          // creating a unique room ID where the userId and targetUserId both will be connected to chat and send the message to the roomId
          const roomId = getHashedRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          // save the message to DB
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            // adding the participants
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          // adding the message to chat (create-first-message or subsequent messages)
          chat.messages.push({
            senderId: userId,
            text,
          });

          // saving the chat in the DB
          await chat.save();

          // emit to room so both participants receive the message
          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
          });
        } catch (err) {
          console.error(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
