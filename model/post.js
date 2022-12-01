const dbo = require("../db/conn");

async function savePost(title, description, author, category, url, image) {
  let db_connect = dbo.getDb();
  try {
    const resp = await db_connect.collection("posts").insertOne({
      title,
      description,
      author,
      category,
      url,
      image,
    });
    return resp;
  } catch {
    return false;
  }
}

async function listPosts(search) {
  let db_connect = dbo.getDb();
  let news = [];
  try {
    if (search) {
      const search_regex = new RegExp(search, "i");
      news = await db_connect
        .collection("posts")
        .find({
          $or: [
            { title: { $regex: search_regex } },
            { description: { $regex: search_regex } },
            { author: { $regex: search_regex } },
            { category: { $regex: search_regex } },
          ],
        })
        .sort({ _id: -1 })
        .toArray();
    } else {
      news = await db_connect
        .collection("posts")
        .find({})
        .sort({ _id: -1 })
        .toArray();
    }
  } catch {}
  return news;
}

module.exports = {
  savePost,
  listPosts,
};
