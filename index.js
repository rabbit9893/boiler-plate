const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

const config = require("./config/key");

const { User } = require("./models/User");

// application/x-www-form-unlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());

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

app.post("/register", (req, res) => {
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
