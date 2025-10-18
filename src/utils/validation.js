const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password, age, gender } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not provided. Please provide the name");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Not a valid Email ID");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  } else if (age < 18) {
    throw new Error("Minimum age should be 18");
  } else if (!["male", "female", "others"].includes(gender)) {
    throw new Error("Please enter a valid gender");
  }
};

module.exports = {
  validateSignUpData,
};
