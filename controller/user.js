const {
  verifyUserExists,
  createUser,
  getUser,
  checkPassword,
  signToken,
  verifyToken,
} = require("../model/user");

async function register(req, res) {
  const { user, email, password } = req.body;
  if (!user || !email || !password) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  if (await verifyUserExists(user, email)) {
    return res.json({
      message: "Username or e-mail already taken",
    });
  }

  await createUser(user, email, password);
  const { token, isAdmin } = signToken(user, email);
  return res.status(200).json({
    message: "Registered successfully",
    token,
    isAdmin,
  });
}

async function login(req, res) {
  const { user, email, password, token } = req.body;

  if (token) {
    try {
      const decoded = await verifyToken(token);
      return res.json({ decoded });
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  if (!password || (!email && !user)) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const userObj = await getUser(user, email);
  if (!userObj) {
    return res.json({ error: "Invalid credentials" });
  }

  if (await checkPassword(password, userObj)) {
    const { token, isAdmin } = signToken(userObj.user, userObj.email);
    return res.json({
      message: "Logged in successfully",
      token,
      isAdmin,
    });
  }
  return res.json({ error: "Invalid credentials" });
}

module.exports = {
  register,
  login,
};
