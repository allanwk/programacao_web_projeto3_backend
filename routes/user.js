const express = require("express");
const user = require("../controller/user");
const userRoutes = express.Router();

userRoutes.route("/register").post((req, res) => {
  user.register(req, res);
});

userRoutes.route("/login").post((req, res) => {
  user.login(req, res);
});

module.exports = userRoutes;
