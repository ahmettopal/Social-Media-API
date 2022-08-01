const db = require("../models");
const Post = db.posts;
const User = db.user;
const getExistingKeys = require("../utils/getExistingKeys");

exports.createPost = async (req, res) => {
  const { description, date, title, } =
    req.body;
  const data = getExistingKeys(
    { description, date, title, },
    true
  );
  try {
    const post = await Post.create({
      ...data,
      userId: req.userId,
      image: /*"/uploads"*/ "/" + req.file.filename,
    });

    res.send({ post });
  } catch (error) {
    res.status(500).send({ message: err.message });
  }
};

// Get the comments for a given post
exports.findPostById = async (req, res) => {
  return Post.findOne({
    where: { id: req.params.postId },
    include: [{ model: User, as: "user", attributes: ["avatar", "username"] }],
  })
    .then((post) => {
      res.status(200).send({ post });
    })
    .catch((err) => {
      console.log(">> Error while finding post: ", err);
    });
};

exports.deletePost = async (req, res) => {
  return Post.destroy(
    { where: { id: req.params.postId } },
    { include: ["comments", "likes"] }
  )
    .then((post) => {
      res.status(200).send({ post });
    })
    .catch((err) => {
      console.log(">> Error while deleting post: ", err);
    });
};

exports.updatePost = async (req, res) => {
  const id = req.params.postId;
  const { description, date, title, } =
    req.body;
  const data = getExistingKeys(
    { description, date, title, },
    true
  );
  Post.update(data, { where: { id: id } })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Post was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Post with id=${id}. Maybe Post was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Post with id=" + id,
      });
    });
};
