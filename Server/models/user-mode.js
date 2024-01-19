const mongoose = require("mongoose");
const {Schema} = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  });
  
  userSchema.methods.isStudent = function () {
    return this.role == "student";
  };
  
userSchema.methods.isIsntructor = function(){
return this.role == "instructor";
}

userSchema.methods.comparePassword = async function (password, callback) {
    let result;
    try {
      result = await bcrypt.compare(password, this.password);
      return callback(null, result);
    } catch (e) {
      return callback(e, result);
    }
  };
  

//middLewares
userSchema.pre("save", async function (next) {
    // this 代表 mongoDB 內的 document
    if (this.isNew || this.isModified("password")) {
      const hashValue = await bcrypt.hash(this.password, 10);
      this.password = hashValue;
    }
    next();
  });
  

module.exports = mongoose.model("User",userSchema);