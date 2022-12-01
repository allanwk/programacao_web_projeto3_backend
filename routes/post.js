const express = require("express");
const multer = require("multer");
const { createPost, getPosts } = require("../controller/post");

const postRoutes = express.Router();

postRoutes.post(
  "/",
  multer({ storage: multer.memoryStorage() }).single("file"),
  createPost
);

postRoutes.get("/", getPosts);

module.exports = postRoutes;
