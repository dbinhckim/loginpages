const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define CandidateTest model
const CandidateTest = sequelize.define('CandidateTest', {
  candidate_test_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'candidates',
      key: 'candidate_id'
    }
  },
  test_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tests',
      key: 'test_id'
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  access_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  access_token_expiry: {
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
  tableName: 'candidate_tests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CandidateTest;
