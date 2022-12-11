const dbo = require("../db/conn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function verifyUserExists(user, email) {
  let db_connect = dbo.getDb();
  if (
    await db_connect.collection("users").findOne({ $or: [{ user }, { email }] })
  ) {
    return true;
  }
  return false;
}

async function createUser(user, email, password) {
  let db_connect = dbo.getDb();
  try {
    const hash = await bcrypt.hash(password, 10);
    const userObj = { user, password: hash, email };
    await db_connect.collection("users").insertOne(userObj);
  } catch {
    return false;
  }
}

async function getUser(user, email) {
  let db_connect = dbo.getDb();
  try {
    const userObj = await db_connect.collection("users").findOne({
      $or: [{ user: user }, { user: email }, { email: user }, { email: email }],
    });
    return userObj;
  } catch (err) {
    return false;
  }
}

async function checkPassword(password, userObject) {
  return await bcrypt.compare(password, userObject.password);
}

function signToken(user, email) {
  const isAdmin = user === "admin" && email.includes("admin");
  const token = jwt.sign({ user, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: 3600,
  });
  return { token, isAdmin };
}

async function verifyToken(token) {
  return new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) =>
      err ? reject("Invalid token") : resolve(decoded)
    )
  );
}

module.exports = {
  verifyUserExists,
  createUser,
  getUser,
  checkPassword,
  signToken,
  verifyToken,
};
