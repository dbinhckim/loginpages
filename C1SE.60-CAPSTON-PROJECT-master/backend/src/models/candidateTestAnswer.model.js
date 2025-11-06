const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define CandidateTestAnswer model
const CandidateTestAnswer = sequelize.define('CandidateTestAnswer', {
  answer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidate_test_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'candidate_tests',
      key: 'candidate_test_id'
    }
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'question_id'
    }
  },
  selected_option_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'question_options',
      key: 'option_id'
    }
  },
  text_answer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'candidate_test_answers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CandidateTestAnswer;
