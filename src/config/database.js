const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://namastedev:GQPcwUVXM5rQ88lm@nastenode.0zwa9ht.mongodb.net/devTinder"
  );
};

module.exports = {
  connectDB,
};
