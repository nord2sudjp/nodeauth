var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var logger = require("morgan");

var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var multer = require("multer");
upload = multer({ dest: "./uploads" });

var flash = require("connect-flash");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var db = mongoose.connection;

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var User = require("./models/user");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Static path
app.use(express.static(path.join(__dirname, "public")));
// Passport設定前にstaticを設定すること
// Passport設定後だとstaticパスについてもdeserializationが動きおかしくなる

// Optional modules
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  // console.log("serilizeUser: %s", user);
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    // console.log("deserializeUser: try to find %s", id);
    const user = await User.getUserById(id);
    // console.log("deserializeUser: find user %s", user);
    done(null, user);
  } catch (e) {
    console.log(done(e, null));
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    /*
    console.log("Passport LocalStrategy for %s", username);
    return done(null, { name: username });
    */
    try {
      /*
       console.log(
        "LocalStrategy: LocalStratey start for %s@%s",
        username,
        password
      );
      */
      const user = await User.findByCredentials(username, password);
      // console.log("LocalStrategy: User find by credential %s", user);
      return done(null, user);

      /*
      const user = await User.getUserByUsername(username);
      console.log("LocalStrategy:", user);
      try {
        isMatch = User.comparePassword(password, user.password);
        return done(null, user);
      } catch (e) {
        return done(null, false, { message: "Invalid Password" });
      }
      */
    } catch (e) {
      return done(null, false, { message: "Unknown User" });
    }
  })
);

app.use(flash());

// Database
require("./db/mongoose");

// Routing
app.use(logger("dev"));
app.use(express.json());
//app.use(bodyParser);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.bodyParser());

app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  console.log("/*: res.locals.user %s", res.locals.user);
  next();
}); // ルーティングの前にないと実行されない。

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
