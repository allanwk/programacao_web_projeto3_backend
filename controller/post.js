const { listPosts, savePost } = require("../model/post");
const { verifyToken } = require("../model/user");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  secure: true,
});

async function createPost(req, res) {
  const { title, description, author, category, url } = req.body;
  const { file } = req;
  if (!title || !description || !author || !category || !url || !file) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const { authorization: authorizationHeader } = req.headers;
  if (authorizationHeader) {
    const token = authorizationHeader.split("Bearer ")[1];
    try {
      const decoded = await verifyToken(token);
      if (!decoded.isAdmin) {
        return res.status(401).json({
          message: "You need to be an administrator to create posts",
        });
      }
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
    "base64"
  )}`;

  let imageUrl;
  try {
    const resp = await cloudinary.uploader.upload(base64, {
      folder: "projeto_web",
    });
    imageUrl = resp.secure_url;
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error uploading image to Cloudinary" });
  }

  if (savePost(title, description, author, category, url, imageUrl)) {
    return res.status(200).json({ message: "Post saved successfully" });
  } else {
    return res.status(500).json({ error: "Error saving post" });
  }
}

async function getPosts(req, res) {
  try {
    const { search } = req.query;
    const news = await listPosts(search);
    res.status(200).json({ news });
  } catch {
    res.status(500);
  }
}

module.exports = {
  createPost,
  getPosts,
};
