const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

function signToken(userObj) {
  const { user, email } = userObj;
  const isAdmin = user === "admin" && email.includes("admin");
  const token = jwt.sign({ user, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: 3600,
  });
  return token;
}

userRoutes.route("/register").post(async (req, res) => {
  const { user, email, password } = req.body;
  if (!user || !email || !password) {
    return res.status(400).json({ message: "Parâmetros incorretos" });
  }

  let db_connect = dbo.getDb();

  if (
    await db_connect.collection("users").findOne({ $or: [{ user }, { email }] })
  ) {
    return res.json({
      message: "Já existe um usuário com este login ou e-mail",
    });
  }

  await bcrypt.hash(password, 10, async (err, hash) => {
    const userObj = { user, password: hash, email };
    await db_connect.collection("users").insertOne(userObj);
    return res
      .status(200)
      .json({ message: "Registrado com sucesso", token: signToken({ user }) });
  });
});

userRoutes.route("/login").post(async (req, res) => {
  const { user, email, password } = req.body;
  let db_connect = dbo.getDb();

  if (!password || (!email && !user)) {
    return res.status(400).json({ message: "Parâmetros incorretos" });
  }

  const userObj = await db_connect
    .collection("users")
    .findOne({ $or: [{ user }, { email }] });
  if (!userObj) {
    return res.json({ error: "Usuário não existe" });
  }

  const passwordMatch = await bcrypt.compare(password, userObj.password);
  if (passwordMatch) {
    return res.json({
      message: "Logado com sucesso",
      token: signToken(userObj),
    });
  } else {
    return res.json({ error: "Senha incorreta" });
  }
});

module.exports = userRoutes;
