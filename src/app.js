const express = require("express");
const { adminAuth, userAuth } = require("./middlewares/auth");

const app = express();

/* checking the authorization here, since we use "use" we are checking for all HTTP methods
all "/admin/*" requests will be resolved only when the authorization is success */
app.use("/admin", adminAuth);

app.post("/user/login", (req, res) => {
  // logic to handle the login request
  res.send("User logged in successfully");
});

app.post("/user/signUp", (req, res) => {
  // logic to handle the signup request
  res.send("User is registered successfully");
});

/* Authorization needed here to get the information about the user */
app.get("/user/getData", userAuth, (req, res) => {
  // logic to get the user data
  res.send("User data sent");
});

app.get("/user/login", (req, res) => {
  res.send("User data is sent");
});

/* this will be executed only when the authorization is success */
app.get("/admin/getAllData", (req, res) => {
  // Logic to get all the data
  res.send("All data is sent");
});

/* this will be executed only when the authorization is success */
app.get("/admin/deleteUser", (req, res) => {
  // Logic to delete the user
  res.send("Deleted the user");
});

app.use("/hello", (req, res) => {
  res.send("Hello Hello Hello");
});

app.use("/test", (req, res) => {
  res.send("Hello from server !!");
});

app.use("/", (req, res) => {
  res.send("Namaste Vaidheeswaran");
});

app.listen(7777);
