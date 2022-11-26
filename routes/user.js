const express = require("express");
const userRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

userRoutes.route("/register").post((req, res) => {
  console.log(req.body);
  return res.status(200).json({ message: "Registrado com sucesso" });
});

userRoutes.route("/login").post((req, res) => {
  console.log(req.body);
  return res.status(200).json({ message: "Logado com sucesso" });
});

module.exports = userRoutes;
