const { authJwt, upload } = require("../middleware");
const controller = require("../controllers/post.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );

    next();
  });

  app.get(
    "/posts",
    authJwt.verifyToken,
    authJwt.isModeratorOrAdminOrUser,
    controller.findAll
  );

  app.post(
    "/post/share",
    authJwt.verifyToken,
    authJwt.isModeratorOrAdmin,
    upload.single("image"),
    controller.createPost
  );

  app.get(
    "/post/:postId",
    //authJwt.verifyToken, authJwt.isModeratorOrAdminOrUser,
    controller.findPostById
  );

  app.post(
    "/post/:postId/like",
    authJwt.verifyToken,
    authJwt.isModeratorOrAdminOrUser,
    controller.likePost
  );

  app.post(
    "/post/:postId/unlike",
    authJwt.verifyToken,
    authJwt.isModeratorOrAdminOrUser,
    controller.unlikePost
  );

  app.delete(
    "/post/delete/:postId",
    authJwt.verifyToken,
    authJwt.isModeratorOrAdmin,
    controller.deletePost
  );

  app.put(
    "/post/updateDescription/:postId",
    authJwt.verifyToken,
    authJwt.isModeratorOrAdmin,
    controller.updatePost
  );

  app.put(
    "/post/:postId/update",
    authJwt.verifyToken,
    authJwt.isModeratorOrAdmin,
    controller.updatePost
  );
};
