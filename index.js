const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");

const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

// application/x-www-form-unlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    userFindAndModify: false
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World! :)"));

app.post("/api/users/register", (req, res) => {
  // 회원 가입 할 때 필요한 정보들을 Client에서 가져오면
  // 그것들을 데이터 베이스에 넣어주는 작업(User 모델을 가져와야 함)

  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err }); // 에러가 있다고 json형식으로 전달
    return res.status(200).json({
      success: true
    });
  });
});

app.post("/login", (req, res) => {
  // 요청된 이메일을 데이터베이스에서 있는지 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      });
    }

    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 체크
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." });

      // 비밀번호까지 맞다면 토큰 생성
      user.generateToken((err, user) => {
        // status(400) : 에러가 있다고 Client에게 전달해주는 것
        if (err) return res.status(400).send(err);

        // user 안에 있는 토큰을 쿠키, 로컬스토리지에 저장
        res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true라는 뜻
  // => Client에 정보를 전달해줘야 함
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user_role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
