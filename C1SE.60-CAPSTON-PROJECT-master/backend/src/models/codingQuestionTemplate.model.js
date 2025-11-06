const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define CodingQuestionTemplate model
const CodingQuestionTemplate = sequelize.define('CodingQuestionTemplate', {
  template_id: {
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
  programming_language: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  code_template: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  test_cases: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'coding_question_templates',
  timestamps: false
});

module.exports = CodingQuestionTemplate;
