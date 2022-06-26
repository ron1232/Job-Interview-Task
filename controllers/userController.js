import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { transport } from "../config/mail.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";

const authUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide email address");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.send("Check your mail, token was sent");

  const generatedOTPToken = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

  const mailOptions = {
    from: "noreply@ronbarak.com",
    to: email,
    subject: "Heres your OTP token",
    text: generatedOTPToken,
  };

  try {
    const hashedGeneratedOTPToken = await bcrypt.hash(generatedOTPToken, 10);
    user.otpToken = hashedGeneratedOTPToken;
    await user.save();
  } catch (e) {
    mailOptions.text = e;
  }

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
});

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  let user = null;

  try {
    user = await User.create({
      firstName,
      lastName,
      email,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }

  if (!user) {
    res.status(400);
    throw new Error("Invalid user data");
  }

  return res.status(201).json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otpToken } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user?.otpToken) {
    res.status(401);
    throw new Error("Invalid reuqest");
  }

  if (!email || !otpToken) {
    res.status(400);
    throw new Error(`email and otpToken are required`);
  }

  let result = false;

  try {
    result = await bcrypt.compare(otpToken, user?.otpToken);
  } catch (error) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  if (!result) {
    res.status(401);
    throw new Error("Invalid token");
  }

  user.otpToken = undefined;
  await user.save();

  res.json({
    token: generateToken(user._id, user.email),
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }
  res.status(404);
  throw new Error("User not found");
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;

  await user.save();

  return res.send("User has been updated");
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(201).json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
});

export { authUser, getUserProfile, registerUser, verifyOTP, updateUserProfile, getUser };
