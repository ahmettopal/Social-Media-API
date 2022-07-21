const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const { randomBytes } = require("crypto");

exports.signup = async (req, res) => {
  const randomByte = randomBytes(150).toString("hex");
  const expireDate = new Date();
  expireDate.setHours(expireDate.getHours() + 4);
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    password: bcrypt.hashSync(req.body.password, 8),
    accountVerify: {
      token: randomByte,
      expireDate,
    },
  }).then((user) => {
    if (req.body.roles) {
      Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles,
          },
        },
      }).then((roles) => {
        user.setRoles(roles).then(() => {
          res.send({
            message:
              "Register Success, please verify your email",
          });
        });
      });
    } else {
      // user role = 1
      user.setRoles([1]).then(() => {
        res.send({
          message:
            "Register Success, please verify your email",
        });
      });
    }
  }).catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.signin = async (req, res) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  }).then((user) => {
    if (!user) {
      return res.status(404).send({ message: "User Not Found." });
    }
    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Password False, Check Again",
      });
    }

    if (!user.isVerify) {
      return res.status(401).send({
        accessToken: null,
        message:
          "Please Verify your E-mail Adress",
      });
    }

    var token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      config.secret,
      {
        expiresIn: "730 days", // 24 hours
      }
    );

    var authorities = [];
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        authorities.push("ROLE_" + roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        biyografi: user.biyografi,
        email: user.email,
        roles: authorities,
        accessToken: token,
      });
    });
  }).catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.activateAccount = async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).send({
      message: "Token is required.",
    });
  }

  const user = await User.findOne({
    where: { "accountVerify.token": key },
    attributes: ["id", "accountVerify"],
  });

  if (!user) {
    return res.status(400).send({
      message: "Token not found.",
    });
  }

  if (new Date() <= new Date(user.accountVerify.expireDate)) {
    await User.update(
      {
        isVerify: true,
        accountVerify: {
          token: "",
          expireDate: null,
        },
      },
      {
        where: { id: user.id },
      }
    );
  }

  return res.status(200).send({
    message:
      "Thanks to Verify your email",
  });
};
