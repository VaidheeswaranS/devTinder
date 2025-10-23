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

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];
  const { firstName, lastName, age, gender, photoUrl, about, skills } =
    req.body;

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  if (!isEditAllowed) {
    throw new Error(
      "Invalid Edit request - only photoUrl, about, and skills can be edited"
    );
  }

  // Only validate fields that are actually provided
  if (
    firstName !== undefined &&
    !validator.isLength(firstName, { min: 2, max: 30 })
  ) {
    throw new Error(
      "Enter a valid First Name. Should be between 2 to 30 characters"
    );
  }

  if (
    lastName !== undefined &&
    !validator.isLength(lastName, { min: 2, max: 30 })
  ) {
    throw new Error(
      "Enter a valid Last Name. Should be between 2 to 30 characters"
    );
  }

  if (age !== undefined && !validator.isInt(age, { min: 18, max: 100 })) {
    throw new Error("Age should be greater than 18");
  }

  if (gender !== undefined && (gender === "male" || "female")) {
    throw new Error("Enter a valid gender");
  }

  if (photoUrl !== undefined && !validator.isURL(photoUrl)) {
    throw new Error("Enter a valid photo URL");
  }

  if (about !== undefined && !validator.isLength(about, { min: 5, max: 250 })) {
    throw new Error("Enter the description of less than 250 characters");
  }

  if (skills !== undefined) {
    if (skills.length < 1 || skills.length > 15) {
      throw new Error("Skills must contain between 1 and 15 items");
    }
  }

  return true;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
