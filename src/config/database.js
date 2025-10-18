const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://namastedev:2eB33FgRc1OT2zfI@nastenode.0zwa9ht.mongodb.net/devTinder"
  );
};

module.exports = {
  connectDB,
};
