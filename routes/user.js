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

async function verifyToken(token) {
  return new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) =>
      err ? reject({}) : resolve(decoded)
    )
  );
}

userRoutes.route("/register").post(async (req, res) => {
  const { user, email, password } = req.body;
  if (!user || !email || !password) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  let db_connect = dbo.getDb();

  if (
    await db_connect.collection("users").findOne({ $or: [{ user }, { email }] })
  ) {
    return res.json({
      message: "Username or e-mail already taken",
    });
  }

  await bcrypt.hash(password, 10, async (err, hash) => {
    const userObj = { user, password: hash, email };
    await db_connect.collection("users").insertOne(userObj);
    return res
      .status(200)
      .json({ message: "Registered successfully", token: signToken({ user }) });
  });
});

userRoutes.route("/login").post(async (req, res) => {
  const { user, email, password, token } = req.body;
  let db_connect = dbo.getDb();

  if (token) {
    try {
      await verifyToken(token);
      return res.json({ error: "Invalid token" });
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  if (!password || (!email && !user)) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const userObj = await db_connect.collection("users").findOne({
    $or: [{ user: user }, { user: email }, { email: user }, { email: email }],
  });
  if (!userObj) {
    return res.json({ error: "Invalid credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, userObj.password);
  if (passwordMatch) {
    return res.json({
      message: "Logado com sucesso",
      token: signToken(userObj),
    });
  } else {
    return res.json({ error: "Invalid credentials" });
  }
});

module.exports = userRoutes;
