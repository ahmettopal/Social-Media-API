const { authJwt, upload, verifySignUp } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );

        next();
    });

    app.get("/user/all", controller.allAccess);

    app.get("/users", authJwt.verifyToken, controller.allUsers);

    app.get(
        "/user/:userId",
        authJwt.verifyToken,
        authJwt.isModeratorOrAdminOrUser,
        controller.userInfo
    );

    app.get(
        "/userinfo/:userId",
        authJwt.verifyToken,
        authJwt.isModeratorOrAdminOrUser,
        controller.userInfoMobile
    );

    app.get(
        "/user/user/:username",
        //authJwt.verifyToken, authJwt.isModeratorOrAdminOrUser,
        controller.getUserInfo
    );

    app.get(
        "/user/:userId/posts",
        //authJwt.verifyToken, authJwt.isModeratorOrAdminOrUser,
        controller.moderatorBoard
    );

    app.get(
        "/user/:userId/userposts",
        //authJwt.verifyToken, authJwt.isModeratorOrAdminOrUser,
        controller.getUserBoard
    );

    app.get(
        "/user/:userId/profileModFeed",
        authJwt.verifyToken,
        authJwt.isModeratorOrAdminOrUser,
        controller.profileModFeed
    );

    app.get(
        "/user/:userId/profileUserFeed",
        authJwt.verifyToken,
        authJwt.isModeratorOrAdminOrUser,
        controller.profileUserFeed
    );

    app.delete(
        "/user/delete/:username",
        authJwt.verifyToken,
        authJwt.isAdmin,
        controller.deleteUser
    );

    app.put(
        "/change_name",
        authJwt.verifyToken,
        authJwt.isModeratorOrAdminOrUser,
        verifySignUp.checkDuplicateUsername,
        controller.changeName
    );

    app.put(
        "/change_password",
        authJwt.verifyToken,
        authJwt.isModeratorOrAdminOrUser,
        controller.changePassword
    );

    app.put(
        "/change_avatar",
        authJwt.verifyToken,
        authJwt.isModeratorOrAdminOrUser,
        upload.single("avatar"),
        controller.changeAvatar
    );

    app.put("/users/me", authJwt.verifyToken, controller.updateUser);

    app.post("/reset_password", controller.resetPassword);

    app.get("/reset_password/verification", controller.resetPasswordVerification);

    app.post("/reset_password/new_password", controller.resetNewPassword);
};
