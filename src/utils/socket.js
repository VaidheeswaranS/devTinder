const socket = require("socket.io");
const crypto = require("crypto");

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

    socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
      // creating a unique room ID where the userId and targetUserId both will be connected to chat and send the message to the roomId
      const roomId = getHashedRoomId(userId, targetUserId);
      console.log(firstName + " " + text);
      io.to(roomId).emit("messageReceived", { firstName, text });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
