let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;//把JWT的值拉出來
const User = require("../models").user;

module.exports = (passport) => {//passport是指passport的套件
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SERVRET;

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
        console.log("jwt_payload : ");
        console.log(jwt_payload);
      try {
        let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (foundUser) {
          return done(null, foundUser); // req.user <= foundUser
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};
