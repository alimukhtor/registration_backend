import express from "express";
import UsersModel from "./schema.js";
import bcrypt from "bcrypt";
import { JWTAuthenticate } from "../../auth/tools.js";

const userRouter = express.Router();
userRouter.get("/", async (req, res, next) => {
  try {
    const user = await UsersModel.find();
    res.send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!(name && email && password)) {
      res.status(200).send({ msg: "All the fields are required!" });
    }
    const oldUser = await UsersModel.findOne({ email });
    if (oldUser) {
      res.status(409).send({ msg: "User already exist with this email!" });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await UsersModel.create({
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });
    res.status(204).send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!(email && password))
      res.status(204).send({ msg: "All fields are required!" });
    const user = await UsersModel.findOne({ email });
    console.log(user);
    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = await JWTAuthenticate(user);
      user.token = accessToken;
      user.lastLogin = Date.now();
      res.status(200).send(user);
    } else {
      res.status(404).send({ msg: "User with this email not found!" });
    }

    UsersModel.findByIdAndUpdate(
      user._id,
      { lastLogin: Date.now() },
      (err, data) => {
        if (err) console.log(err);
        else console.log("Successfully updated the lastLogin", data);
      }
    );
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/deleteUsers", async (req, res, next) => {
  try {
    const selectedUsers = req.body;
    // HARD DELETE
    UsersModel.deleteMany(
      {
        _id: {
          $in: selectedUsers,
        },
      },
      function (err, result) {
        if (err) {
          res.status(404).send(err);
        } else {
          res.status(200).send(selectedUsers);
        }
      }
    );
    // SOFT DELETE
    // await User.updateMany({ _id: { $in: selectedUsers } }, { isDeleted: true });
  } catch (error) {
    next(error);
  }
});

userRouter.put("/status", async (req, res, next) => {
  try {
    const { title, isChecked } = req.body;
    UsersModel.updateMany(
      {
        _id: {
          $in: isChecked,
        },
      },
      { $set: { status: title } },
      { multi: true },
      function (err, result) {
        if (err) {
          res.status(404).send(err);
        } else {
          res.status(200).send(isChecked);
        }
      }
    );
  } catch (error) {
    next(error);
  }
});
export default userRouter;
