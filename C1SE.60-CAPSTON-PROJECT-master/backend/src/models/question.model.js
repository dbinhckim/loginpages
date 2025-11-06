const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define Question model
const Question = sequelize.define('Question', {
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'question_categories',
      key: 'category_id'
    }
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TEXT', 'CODING'),
    allowNull: false
  },
  difficulty_level: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT'),
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'questions',
  timestamps: false
});

module.exports = Question;
