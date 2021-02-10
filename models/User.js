const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

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

// user 모델에 정보를 저장(save)하기 전에 실행
userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    // 비밀번호 암호화하기
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err); // next를 하게 되면 바로 index.js의 users.save() 실행

      bcrypt.hash(user.password, salt, function (err, hash) {
        // user.password : POSTMAN에 내가 넣는 비밀번호(암호화 되지 않은 비밀번호)
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPassword 1234567 암호화된 비밀번호 $2b$10$J9pjsMZ0cZa79U6QJy/Lw.cJWxFW1/W/CvCA1o7QBQtzPGrZ4pF7a
  // 복호화를 할 수 없으므로 plainPassword를 암호화해서 같은지 확인
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    // this.password : userSchema의 password
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;

  // jsonwebtoken을 이용해서 token을 생성
  var token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  // user._id + "" = token;
  // 토큰을 Decode(복호화) 함
  jwt.verify(token, "secretToken", function (err, decoded) {
    // 유저 아이디를 이용해서 유저를 찾은 다음 클라이언트에서 가져온 토큰과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
