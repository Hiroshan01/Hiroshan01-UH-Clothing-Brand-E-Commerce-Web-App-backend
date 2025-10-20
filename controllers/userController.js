import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function createUser(req, res) {
  try {
    // Validate required fields
    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.email ||
      !req.body.password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    if (req.body.role == "admin") {
      if (req.user != null) {
        if (req.user.role != "admin") {
          res.status(403).json({
            message: "You are not authorized to create admin account",
          });
          return;
        }
      } else {
        res.status(403).json({
          message:
            "You are not authorized to create an admin please login first",
        });
        return;
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashPassword,
      role: req.body.role || "customer",
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
}

//Login
export function userLogin(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (user == null) {
      res.status(403).json({
        message: "User not found",
      });
    } else {
      const isPasswordCorrect = bcrypt.compareSync(password, user.password); //compare
      if (isPasswordCorrect) {
        // Generate encrypt
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            img: user.img,
          },
          process.env.JWT_KEY
        );
        res.json({
          message: "Login successful",
          token: token,
          role: user.role,
        });
      } else {
        res.status(401).json({
          message: "Invalid password",
        });
      }
    }
  });
}
export async function getUsers(req, res) {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch {
    res.status(500).json({
      message: "Not users available",
    });
  }
}

export async function getUserById(req, res) {
  const userId = req.params.id;
  try {
    const userCheck = await User.findById(userId);
    const user = await User.findOne({ _id: userId, isBlock: false });

    if (!user) {
      return res.status(404).json({
        message: "User not found or blocked",
        debug: {
          userExists: !!userCheck,
          isBlocked: userCheck ? userCheck.isBlock : null,
        },
      });
    }

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      message: "User fetched successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
