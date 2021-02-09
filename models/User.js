const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    // 관리자와 일반 사용자를 구분하기 위해
    type: Number,
    default: 0
  },
  image: String,
  token: {
    // 유효성 관리
    type: String
  },
  tokenExp: {
    // token이 사용할 수 있는 기간
    type: Number
  }
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
