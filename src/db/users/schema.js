import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true},
    password: { type: String },
    status: {type: String, default:"Active"},
    token: { type: String },
    lastLogin: { type: Date, default:Date.now()},
  },
  { timestamps: true }
);
export default model("User", userSchema);
