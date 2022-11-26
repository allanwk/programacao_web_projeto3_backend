const express = require("express");
const { expressjwt } = require("express-jwt");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(require("./routes/user"));

app.use(
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({ path: ["/login", "/register"] })
);

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Invalid token" });
  } else {
    next(err);
  }
});

// get driver connection
const dbo = require("./db/conn");

dbo.connectToServer(function (err) {
  if (err) console.error(err);
  else {
  }
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});
