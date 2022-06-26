import mongoose from "mongoose";

const validateEmail = (email) => {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  return regex.test(email);
};

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, validate: [validateEmail, "Invalid Email Address"] },
    otpToken: { type: String, required: false },
  },
  { timestamps: true }
);

// Virtual for user's full name
UserSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

const User = mongoose.model("User", UserSchema);

export default User;
