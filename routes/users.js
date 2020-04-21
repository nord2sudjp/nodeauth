var express = require("express");
var router = express.Router();
const { body, check, validationResult } = require("express-validator");
var User = require("../models/user");
var passport = require("passport");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", function (req, res, next) {
  res.render("register", { title: "Register", active_register: true });
});

router.get("/login", function (req, res, next) {
  res.render("login", {
    title: "Login",
    active_login: true,
    expressFlashError: req.flash("error"),
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Invalid username or password",
  }),
  function (req, res) {
    // console.log("/login:login success");
    req.flash("success", "You are now logged in");
    res.redirect("/");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are not logged out");
  res.redirect("/users/login");
});

router.post(
  "/register",
  upload.single("profileimage"),
  [
    // username must be an email
    check("name").notEmpty().withMessage("Name field is required"),
    check("email").notEmpty().withMessage("Email field is required"),
    check("email").isEmail().withMessage("Email is not valid"),
    check("username").notEmpty().withMessage("Username fiels is required."),
    check("password").notEmpty().withMessage("Password field is required."),
  ],
  body("password2").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
  async function (req, res, next) {
    console.log(req.body.name);

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    if (req.file) {
      //console.log("/register:Uploading file");
      var profileimage = req.file.filename;
    } else {
      //console.log("/register:No File uploading");
      var profileimage = "noimage.jpg";
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //console.log("/register:Validation:", errors.errors);

      res.render("register", { errors: errors.errors });
    } else {
      //console.log("/register:Validation:", "No errors");
      var newUser = new User({
        name,
        email,
        username,
        password,
        profileimage,
      });

      try {
        await User.createUser(newUser);
        req.flash("success", "You are now registered and can login");
        res.location("/");
        res.redirect("/");
      } catch (err) {
        // console.log("/register:createUser", err.errmsg);
        const errors = [{ msg: err.errmsg }];
        res.render("register", { errors: errors });
      }
    }

    //res.render("register", { title: "Register", active_register: true });
  }
);

module.exports = router;
