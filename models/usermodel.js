const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address:
    [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    }],
  is_blocked: {
    type: Number,
    required: true,
    default: false,
  },
  is_otp_verified: {
    type: Boolean,
    default: 0,
  }
  
});

module.exports = mongoose.model("User", userSchema);
