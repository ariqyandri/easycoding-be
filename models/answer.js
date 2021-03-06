"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      answer.belongsTo(models.comment);
      answer.belongsTo(models.user);
      // define association here
    }
  }
  answer.init(
    {
      content: { type: DataTypes.TEXT, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      commentId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "answer",
    }
  );
  return answer;
};
