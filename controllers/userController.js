import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function createUser(req, res) {
  try {
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
      img: req.body.img,
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

export function userLogin(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (user == null) {
      res.status(403).json({
        message: "User not found",
      });
    } else {
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            _id: user._id,
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

// Delete user function
// Delete user function
export async function deleteUser(req, res) {
  const userId = req.params.id;

  try {
    // Check if the requesting user is authorized
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to delete users",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ✅ Prevent admin from deleting themselves
    // Compare the logged-in user's email with the target user's email
    if (req.user.email && req.user.email === user.email) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
}

// Update user function
export async function updateUser(req, res) {
  const userId = req.params.id;

  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Authorization check: user can update their own account or admin can update any
    const isOwnAccount = req.user.email && req.user.email === req.body.email;
    const isAdmin = req.user.role === "admin";

    if (!isOwnAccount && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to update this user",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Role change requires admin privileges
    if (req.body.role && req.body.role !== user.role) {
      if (!isAdmin) {
        return res.status(403).json({
          message: "Only admins can change user roles",
        });
      }
    }

    // Prepare update data
    const updateData = {};

    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.email) {
      // Check if new email already exists
      const existingUser = await User.findOne({
        email: req.body.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }
      updateData.email = req.body.email;
    }
    if (req.body.img) updateData.img = req.body.img;
    if (req.body.role && isAdmin) updateData.role = req.body.role;

    // Handle password update
    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    // Handle block status (admin only)
    if (req.body.isBlock !== undefined && isAdmin) {
      updateData.isBlock = req.body.isBlock;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        isBlock: updatedUser.isBlock,
        img: updatedUser.img,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
}

//get user
export async function getUserProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
      });
    }
    const user = await User.findOne({
      email: req.user.email,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        img: user.img,
        isBlock: user.isBlock,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
