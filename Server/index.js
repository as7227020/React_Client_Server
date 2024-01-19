const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);//直接執行./config/passport的方法並丟進passport套件資源

const cors = require("cors");

mongoose.connect("mongodb://localhost:27017/mernDB").then(()=>{console.log("連接至mongodb")}).catch((e) =>{console.log(e)});

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cors());//本地溝通用

app.use("/api/user",authRoute);


//只有登入系統的人 才能去新增/註冊課程
// course route應該被jwt保護 
// 如果request header內部沒有jwt，則request就會被視為是unauthorized
app.use(
    "/api/courses",
    passport.authenticate("jwt", { session: false }),//middlewares 執行config/passport.js的use方法 去解JWT 顯示原本內容
    courseRoute //經過上面middlewares 通過後才可以訪問courseRoute
  );

app.listen(8080,()=>{console.log("後端伺服器以聆聽8080 PORT")})
