const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
    console.log("course route正在接受一個request...");
    next();
  });
  
// 用講師id來尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用學生id來尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })//find會給array 跟findOne差別
      .populate("instructor", ["email", "username"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 獲得系統中的所有課程
router.get("/all", async (req, res) => {
    try {
      let courseFound = await Course.find({})
        .populate("instructor", ["username", "email"])//需先使用populate 因為要先用mogoDB的資料轉換成username和email
        //  .populate("instructor", ["username", "email", "password"])//需先使用populate 要拿與講師使用者對應的ID的["username", "email", "password"]
        .exec();//最後再把資料執行顯示
      return res.send(courseFound);
    } catch (e) {
      return res.status(500).send(e);
    }
  });
  
// 用課程id尋找課程
router.get("/find/:_id", async (req, res) => {
    let { _id } = req.params;
    try {
      let courseFound = await Course.findOne({ _id })//findOne給物件
        .populate("instructor", ["email"])//拿該課程講師的信箱
        .exec();
      return res.send(courseFound);
    } catch (e) {
      return res.status(500).send(e);
    }
  });

// 讓學生透過課程id來註冊新課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();//findOne給物件
    course.students.push(req.user._id);
    await course.save();
    return res.send("註冊完成");
  } catch (e) {
    return res.send(e);
  }
});


  //新增課程
  router.post("/create", async (req, res) => {
    // 驗證數據符合規範
    let { error } = courseValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
  
    if (req.user.isStudent()) {
      return res
        .status(400)
        .send("只有講師才能發佈新課程。若你已經是講師，請透過講師帳號登入。");
    }
  
    let { title, description, price } = req.body;
    try {
      let newCourse = new Course({
        title,
        description,
        price,
        instructor: req.user._id,
      });
      let savedCourse = await newCourse.save();
      return res.send("新課程已經保存");
    } catch (e) {
      return res.status(500).send("無法創建課程。。。");
    }
  });

  // 更改課程
router.patch("/change/:_id", async (req, res) => {
    // 驗證數據符合規範
    let { error } = courseValidation(req.body);//body夾帶的參數
    if (error) return res.status(400).send(error.details[0].message);
  
    let { _id } = req.params;//用params 是因為上方的patch("/change/:_id" => :_id 要拿_id的值
    // 確認課程存在
    try {
      let courseFound = await Course.findOne({ _id });
      if (!courseFound) {
        return res.status(400).send("找不到課程。無法更新課程內容。");
      }
  
      // 使用者必須是此課程講師，才能編輯課程
      if (courseFound.instructor.equals(req.user._id)) {//req.user._id => JWT的使用者ID
        let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
          new: true,
          runValidators: true,
        });
        return res.send({
          message: "課程已經被更新成功",
          updatedCourse,
        });
      } else {
        return res.status(403).send("只有此課程的講師才能編輯課程。");
      }
    } catch (e) {
      return res.status(500).send(e);
    }
  });
  
  //刪除
  router.delete("/delete/:_id", async (req, res) => {
    let { _id } = req.params;
    // 確認課程存在
    try {
      let courseFound = await Course.findOne({ _id }).exec();
      if (!courseFound) {
        return res.status(400).send("找不到課程。無法刪除課程。");
      }
  
      // 使用者必須是此課程講師，才能刪除課程
      if (courseFound.instructor.equals(req.user._id)) {
        await Course.deleteOne({ _id }).exec();
        return res.send("課程已被刪除。");
      } else {
        return res.status(403).send("只有此課程的講師才能刪除課程。");
      }
    } catch (e) {
      return res.status(500).send(e);
    }
  });

  
module.exports = router;