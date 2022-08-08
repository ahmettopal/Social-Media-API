module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define("likes", {
        isParticipant: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });

    return Like;
};
