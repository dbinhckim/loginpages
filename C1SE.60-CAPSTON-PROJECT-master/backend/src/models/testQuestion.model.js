const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define TestQuestion model
const TestQuestion = sequelize.define('TestQuestion', {
  test_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'tests',
      key: 'test_id'
    }
  },
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'questions',
      key: 'question_id'
    }
  },
  question_order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  score_weight: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'test_questions',
  timestamps: false
});

module.exports = TestQuestion;
