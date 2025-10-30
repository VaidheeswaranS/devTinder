const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const http = require("http");

// this is to handle the cors error when trying to access the API for different domain
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// this is the middleware provided by Express which will read the request body and convert it into JS object
app.use(express.json());

// this is to read the cookies in the response sent
app.use(cookieParser());

// Importing the routers for different API's
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");
require("dotenv").config();

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed");
    console.error(err);
  });
