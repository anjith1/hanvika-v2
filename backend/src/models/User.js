const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["USER", "WORKER", "ADMIN"],
    default: "USER",
  },
  __v: {
    type: Number,
    select: false
  }
});

// Export with explicit collection name to match the database image (test.users)
module.exports = (connection) => connection.model("User", userSchema, "users");
