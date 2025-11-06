const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define CandidateTestResult model
const CandidateTestResult = sequelize.define('CandidateTestResult', {
  result_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidate_test_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'candidate_tests',
      key: 'candidate_test_id'
    }
  },
  total_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_possible_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  strength_areas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  improvement_areas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_by: {
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
  }
}, {
  tableName: 'candidate_test_results',
  timestamps: false
});

module.exports = CandidateTestResult;
