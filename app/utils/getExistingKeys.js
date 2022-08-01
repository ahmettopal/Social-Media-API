module.exports = (obj, allowEmptyStr = true) => {
  const keys = Object.keys(obj);
  const values = keys.reduce((acc, key) => {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key] !== undefined &&
      obj[key] !== null
    ) {
      acc[key] = obj[key];
      if (!allowEmptyStr && obj[key] === "") {
        delete acc[key];
      }
    }
    return acc;
  }, {});
  return values;
};
