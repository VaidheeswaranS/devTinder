const express = require("express");

const app = express();

/* NOT WORKING, when checked in AI, it is asking to use app.get()
app.use("/", (req, res) => {
  res.send("Namaste Vaidheeswaran");
});

app.use("/hello", (req, res) => {
  res.send("Hello Hello Hello");
});

app.use("/test", (req, res) => {
  res.send("Hello from server !!");
});
*/

/* This is WORKING */
app.get("/", (req, res) => {
  res.send("Namaste Vaidheeswaran");
});

app.get("/hello", (req, res) => {
  res.send("Hello Hello Hello");
});

app.get("/test", (req, res) => {
  res.send("Hello from server !!");
});

app.listen(7777);
