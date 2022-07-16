const db = require("../models");
const { role: Role, sequelize } = db;

const initRoles = async () => {
  const isExist = await Role.findAll();

  if (isExist.length > 0) return false;
  const roles = [
    {
      id: 1,
      name: "user",
    },
    {
      id: 2,
      name: "admin",
    }
  ];
  const promises = roles.map((role) => Role.create(role));
  await Promise.all(promises);
  return true;
};

const initDatabase = async () => {
  await sequelize.sync({ force: false, alter: true });
  await initRoles();
};

module.exports = initDatabase;
