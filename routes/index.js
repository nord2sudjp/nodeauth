var express = require("express");
var auth = require("../middleware/auth");

var router = express.Router();

/* GET home page. */
router.get("/", auth, function (req, res, next) {
  res.render("index", {
    title: "Member Area",
    active_members: true,
    expressFlashSuccess: req.flash("success"),
  });
});

module.exports = router;
