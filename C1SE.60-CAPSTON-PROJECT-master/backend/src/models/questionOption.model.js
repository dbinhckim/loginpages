const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define QuestionOption model
const QuestionOption = sequelize.define('QuestionOption', {
  option_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'question_id'
    }
  },
  option_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'question_options',
  timestamps: false
});

module.exports = QuestionOption;
