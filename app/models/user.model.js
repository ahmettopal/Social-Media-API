module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    username: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    reset_password: {
      type: DataTypes.JSON,

      link: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },

      expireDate: {
        type: DataTypes.DATE,
      },
    },
    deleteAccount: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    isVerify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountVerify: {
      type: DataTypes.JSON,

      token: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      expireDate: {
        type: DataTypes.DATE,
      },
    },
  });

  return User;
};
