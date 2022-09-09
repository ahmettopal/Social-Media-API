module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("comment", {
    text: {
      type: DataTypes.STRING
    },
    isDeletede: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });

  return Comment;
};
