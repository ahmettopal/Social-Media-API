const db = require("../models");
var bcrypt = require("bcryptjs");
const fetch = require("node-fetch");

const Op = db.Sequelize.Op;

const User = db.user;
const Post = db.posts;
const Like = db.likes;
const Role = db.role;

const { randomBytes } = require("crypto");

const StorageService = require("../services/storage.service");

const getExistingKeys = require("../utils/getExistingKeys");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.allUsers = async (req, res) => {
    return User.findAll({
        include: ["roles"],
    })
        .then((users) => {
            res.status(200).send({ users });
        })
        .catch((err) => {
            console.log(">> Error while finding user: ", err);
        });
};

exports.notfollowUsers = (req, res) => {
    User.findAll({
        where: { isVerify: 1 },
        attributes: ["username", "avatar"],
        include: [{ model: Role, where: { id: 2 }, attributes: ["id"] }],
        //include: [{ model: Follow, as: "follows", where: { userId: req.userId }, attributes: ['followed'], }]
    })
        .then((user) => {
            res.send(user);
        })
        .catch((err) => {
            console.log(">> Error while finding user: ", err);
        });
};

exports.moderatorBoard = async (req, res) => {
    return Post.findAll({
        where: { userId: req.params.userId },
        attributes: ["image", "id"],
        include: [{ model: User, as: "user", attributes: ["avatar", "username"] }],
    })
        .then((user) => {
            res.status(200).send({ user });
        })
        .catch((err) => {
            console.log(">> Error while finding user: ", err);
        });
};

exports.getUserBoard = async (req, res) => {
    let userProfileBoard = Like.findAll({
        where: { userId: req.params.userId, isParticipant: 1 },
    });

    userProfileBoard
        .then((userBoard) => {
            let userFeed = userBoard.map((user) => user.postId);
            //res.send({ userFeed });
            Post.findAll({
                where: { id: userFeed },
                attributes: ["image", "id"],
                include: [
                    { model: User, as: "user", attributes: ["avatar", "username"] },
                ],
            })
                .then((userProfileFeed) => {
                    res.status(200).send({ userProfileFeed });
                })
                .catch((err) => {
                    console.log(">> Error while finding user: ", err);
                });
        })
        .catch((err) => {
            console.log(">> Error while finding user: ", err);
        });
};

exports.profileModFeed = async (req, res) => {
    return Post.findAll({
        where: { userId: req.params.userId },
        include: [{ model: User, as: "user", attributes: ["avatar", "username"] }],
        attributes: ["image", "id"],
    })
        .then((post) => {
            res.send({ post });
        })
        .catch((err) => {
            console.log(">> Error while finding post: ", err);
        });
};

exports.profileUserFeed = async (req, res) => {
    let _postId = Like.findAll({
        where: { userId: req.params.userId, isParticipant: 1 },
        include: [{ model: User, as: "user", attributes: ["avatar", "username"] }],
        attributes: ["postId"],
    });

    _postId.then((userPost) => {
        let _post = userPost.map((post) => post.postId);
        Post.findAll({
            where: { id: _post },
            attributes: ["image", "id"],
        })
            .then((post) => {
                res.send(post);
            })
            .catch((err) => {
                console.log(">> Error while finding post: ", err);
            });
    });
};


exports.userInfo = async (req, res) => {
    User.findOne({
        where: { id: req.params.userId },
        include: ["roles"],
        attributes: ["username", "avatar", "biyografi", "id"],
        //include: [{ model: Follow, as: "follows", attributes: ['followed', 'userId'] }]
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "Kullanıcı Bulunamadı" });
            } else {
                return res.status(200).send({ user });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.userInfoMobile = async (req, res) => {
    User.findOne({
        where: { id: req.params.userId },
        attributes: ["biyografi"],
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "Kullanıcı Bulunamadı" });
            } else {
                return res.status(200).send(user);
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.getUserInfo = async (req, res) => {
    User.findOne({
        where: { username: req.params.username },
        include: ["roles"],
        attributes: ["username", "avatar", "biyografi", "id"],
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "Kullanıcı Bulunamadı" });
            } else {
                return res.status(200).send({ user });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.deleteUser = async (req, res) => {
    const username = req.params.username;

    // will fix
    User.destroy({
        where: { username: username },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "user was deleted successfully!",
                });
            } else {
                res.send({
                    message: `Cannot delete user with id=${username}. Maybe Tutorial was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete user with id=" + username,
            });
        });
};

exports.changeName = async (req, res) => {
    User.update({ username: req.body.username }, { where: { id: req.userId } })
        .then((username) => {
            User.findOne({
                where: { id: req.userId },
            })
                .then((changedUsername) => {
                    res.send({ username: changedUsername.username });
                })
                .catch((err) => {
                    res.status(500).send({ message: err.message });
                });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.changeAvatar = async (req, res) => {
    try {
        console.log(req.file);

        await StorageService.uploadFile({
            filePath: req.file.path,
            destination: `users/${req.file.filename}`,
        });

        await User.update(
            { avatar: /*"/static/assets/uploads/"*/ "/" + req.file.filename },
            { where: { id: req.userId } }
        );

        const user = await User.findOne({
            where: { id: req.userId },
        });

        res.send({ avatar: user.avatar });
    } catch (error) {
        res.status(500).send({ message: err.message });
    }
};

exports.changePassword = async (req, res) => {
    User.findOne({
        where: {
            username: req.username,
        },
    })
        .then((user) => {
            var passwordIsSame = bcrypt.compareSync(req.body.password, user.password);

            var oldPasswordIsSame = bcrypt.compareSync(
                req.body.oldPassword,
                user.password
            );

            if (!oldPasswordIsSame) {
                return res.send({
                    message: "Lütfen eski şifrenizi doğru giriniz",
                });
            }

            if (passwordIsSame) {
                return res.send({
                    message: "Eski şifreniz yeni şifreniz ile aynı olamaz",
                });
            }

            if (!passwordIsSame && oldPasswordIsSame) {
                User.update(
                    { password: bcrypt.hashSync(req.body.password, 8) },
                    { where: { username: user.username } }
                )
                    .then(
                        oPassword
                            .create({
                                username: user.username,
                                oPassword: user.password,
                            })
                            .then(
                                res.send({
                                    message: "Şifreniz Başarılı Bir Şekilde Değişti",
                                })
                            )
                            .catch((err) => {
                                res.status(500).send({ message: err.message });
                            })
                    )

                    .catch((err) => {
                        res.status(500).send({ message: err.message });
                    });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.resetPassword = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        where: { email: email },
        attributes: ["id"],
    });

    if (!user) {
        return res.status(400).json({
            code: 400,
            message: "Bu emaile sahip bir hesap bulunamadı.",
        });
    }

    const expireDate = new Date();
    const randomByte = randomBytes(150).toString("hex");
    expireDate.setHours(expireDate.getHours() + 4);

    User.update(
        {
            reset_password: { link: randomByte, expireDate },
        },
        {
            where: { id: user.id },
        }
    ).then(
        res.status(200).send({
            message: "Şifrenizi sıfırlamak için email adresini kontrol ediniz.",
        })
    )
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.resetPasswordVerification = async (req, res) => {
    const { key } = req.query;

    if (!key) {
        return res.status(400).json({
            code: 400,
            message: "Key is required.",
        });
    }

    const user = await User.findOne({
        where: { "reset_password.link": key },
        attributes: ["id", "reset_password"],
    });

    if (!user) {
        return res.status(400).json({
            code: 400,
            message: "Kullanıcı Bulunamadı",
        });
    }

    const expired =
        new Date() <= new Date(user.reset_password.expireDate) ? false : true;

    return !expired
        ? res.status(200).json({ code: 200, key })
        : res.status(400).json({
            code: 400,
            message: "The link has expired",
        });
};

exports.resetNewPassword = async (req, res) => {
    const { key, password } = req.body;

    fetch(
        `http://localhost:8081/reset_password/new_password/verification?key=${key}`,
        {
            method: "GET",
        }
    )
        .then(async (response) => {
            if (response.status === 429) {
                return res.status(response.status).json({
                    code: response.status,
                    message: response.statusText,
                });
            }

            const resp = await response.json();

            if (resp.code === 400 || response.statusCode === 400) {
                return res.status(400).json({
                    code: 400,
                    message: resp.message,
                });
            }

            return resp;
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });

    const user = await User.findOne({
        where: { "reset_password.link": key },
        attributes: ["id", "password"],
    });

    User.update(
        {
            reset_password: {
                link: null,
                expireDate: null,
            },
            password: bcrypt.hashSync(password, 8),
        },
        {
            where: { id: user.id },
        }
    );

    return res.status(200).json({
        code: 200,
        message: "Şifreniz başarılı bir şekilde değişmiştir",
    });
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req;
        const { username, name, email } = req.body;
        const data = {
            ...getExistingKeys({ username, name, email }, false),
        };

        if (data.email) {
            const isExist = await User.findOne({
                where: {
                    email: data.email,
                    id: {
                        [Op.not]: userId,
                    },
                },
            });
            if (isExist) throw new Error("Email kullanılıyor.");
        }

        if (data.username) {
            const username = data.username.toString();
            const isExist = await User.findOne({
                where: {
                    username: username,
                    id: {
                        [Op.not]: userId,
                    },
                },
            });
            if (isExist) throw new Error("Kullanıcı adı kullanılıyor.");
            data.username = username;
        }

        await User.update(data, {
            where: { id: userId },
        });

        return res.json({ code: 200, message: "Bilgiler Kaydedildi" });
    } catch (error) {
        return res.status(400).json({ error, code: 400 });
    }
};
