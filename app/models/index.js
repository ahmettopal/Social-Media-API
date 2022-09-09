const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  port: config.PORT,
  operatorsAliases: 0,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model")(sequelize, Sequelize);
db.role = require("./role.model")(sequelize, Sequelize);
db.posts = require("./post.model")(sequelize, Sequelize);
db.likes = require("./likes.model")(sequelize, Sequelize);
db.comments = require("./comment.model")(sequelize, Sequelize);

db.posts.hasMany(db.comments, { as: "comments" });
db.posts.hasMany(db.likes, { as: "likes" });
db.likes.belongsTo(db.posts, {
  foreignKey: "postId",
  as: "post",
});

db.comments.belongsTo(db.posts, {
  foreignKey: "postId",
  as: "post",
});

db.comments.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});
db.user.hasMany(db.comments, {
  as: "comments",
});

db.likes.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});
db.user.hasMany(db.likes, {
  as: "likes",
});

db.user.hasMany(db.posts, { as: "posts" });
db.posts.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId",
});

db.ROLES = ["user", "admin"];

module.exports = db;